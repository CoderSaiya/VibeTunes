"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback, memo } from "react"
import { View, Text as RNText, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { usePlayerStore } from "@/store/playerStore"
import { Audio, InterruptionModeIOS, InterruptionModeAndroid, type AVPlaybackStatus } from "expo-av"
import { useRouter } from "expo-router"

const Text = RNText

const MiniPlayer: React.FC = () => {
    // chỉ lấy những gì cần render
    const currentSong = usePlayerStore((s) => s.currentSong)
    const isPlaying = usePlayerStore((s) => s.isPlaying)
    const isPlayerScreenVisible = usePlayerStore((s) => s.isPlayerScreenVisible)

    // expose từng action riêng biệt
    const nextSong = usePlayerStore((s) => s.nextSong)
    const prevSong = usePlayerStore((s) => s.prevSong)
    const togglePlay = usePlayerStore((s) => s.togglePlay)
    const setProgress = usePlayerStore((s) => s.setProgress)
    const setDuration = usePlayerStore((s) => s.setDuration)
    const setCurrentTime = usePlayerStore((s) => s.setCurrentTime)
    const setCurrentSong = usePlayerStore((s) => s.setCurrentSong)

    const soundRef = useRef<Audio.Sound | null>(null)
    const lastUpdateRef = useRef<number>(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [localProgress, setLocalProgress] = useState(0)
    const router = useRouter()

    // Audio mode only once
    useEffect(() => {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: false,
        }).catch(console.error)
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync().catch(console.error)
            }
        }
    }, [])

    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
            if (status.error) Alert.alert("Playback error", status.error)
            return
        }

        // throttle updates to store: 500ms
        const now = Date.now()
        if (status.positionMillis && status.durationMillis && now - lastUpdateRef.current > 500) {
            lastUpdateRef.current = now
            const prog = status.positionMillis / status.durationMillis
            setLocalProgress(prog)                         // chỉ cho UI mini player
            setProgress(prog)                              // cập nhật store
            setDuration(status.durationMillis / 1000)
            setCurrentTime(status.positionMillis / 1000)
        }

        if (status.didJustFinish) {
            nextSong()
        }
    }, [nextSong, setProgress, setDuration, setCurrentTime])

    // load / unload sound khi currentSong thay đổi
    useEffect(() => {
        let mounted = true
        const load = async () => {
            if (!currentSong?.fileUrl) return
            if (soundRef.current) {
                await soundRef.current.unloadAsync().catch(console.error)
                soundRef.current = null
            }
            setLoading(true)
            try {
                const { sound } = await Audio.Sound.createAsync(
                    { uri: currentSong.fileUrl },
                    { shouldPlay: isPlaying, progressUpdateIntervalMillis: 500 },
                    onPlaybackStatusUpdate
                )
                if (!mounted) return
                soundRef.current = sound
                setLoading(false)
            } catch (e: any) {
                setLoading(false)
                setError(e.message)
                Alert.alert("Playback Error", e.message)
            }
        }
        load()
        return () => {
            mounted = false
            if (soundRef.current) soundRef.current.unloadAsync().catch(console.error)
        }
    }, [currentSong, isPlaying, onPlaybackStatusUpdate])

    // đồng bộ play/pause
    useEffect(() => {
        const ctrl = async () => {
            const snd = soundRef.current
            if (!snd) return
            const st = await snd.getStatusAsync()
            if (!st.isLoaded) return
            if (isPlaying && !st.isPlaying) await snd.playAsync()
            if (!isPlaying && st.isPlaying) await snd.pauseAsync()
        }
        ctrl().catch(console.error)
    }, [isPlaying])

    const handleClose = useCallback(() => {
        if (soundRef.current) {
            soundRef.current.stopAsync()
                .then(() => soundRef.current?.unloadAsync())
                .then(() => setCurrentSong(null))
                .catch(() => setCurrentSong(null))
        } else {
            setCurrentSong(null)
        }
    }, [setCurrentSong])

    const goToPlayer = useCallback(() => {
        if (currentSong && !isPlayerScreenVisible) {
            router.navigate("/player")
        }
    }, [currentSong, isPlayerScreenVisible, router])

    if (!currentSong || isPlayerScreenVisible) return null

    return (
        <TouchableOpacity onPress={goToPlayer} activeOpacity={0.8}>
            <View style={styles.container}>
                <View style={styles.progressBar}>
                    <View style={[styles.progress, { width: `${localProgress * 100}%` }]} />
                </View>
                <View style={styles.content}>
                    <TouchableOpacity onPress={handleClose} style={styles.collapseButton}>
                        <Ionicons name="chevron-down" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.songInfo}>
                        <Text numberOfLines={1} style={styles.songTitle}>{currentSong.title}</Text>
                        {loading && <Text style={styles.loadingText}>Loading...</Text>}
                        {error && <Text numberOfLines={1} style={styles.errorText}>{error}</Text>}
                    </View>
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={prevSong} style={styles.controlButton}>
                            <Ionicons name="play-skip-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
                            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={nextSong} style={styles.controlButton}>
                            <Ionicons name="play-skip-forward" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 60,
        left: 0, right: 0,
        backgroundColor: "#1A1A1A",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        overflow: "hidden",
        height: 70, zIndex: 999, elevation: 5,
    },
    progressBar: { height: 2, backgroundColor: "rgba(255,255,255,0.2)" },
    progress: { height: "100%", backgroundColor: "#FF3B30" },
    content: { flexDirection: "row", alignItems: "center", padding: 10 },
    collapseButton: { marginRight: 10 },
    songInfo: { flex: 1 },
    songTitle: { color: "#FFF", fontSize: 16, fontWeight: "500" },
    loadingText: { color: "#AAA", fontSize: 12 },
    errorText: { color: "#FF3B30", fontSize: 12 },
    controls: { flexDirection: "row", alignItems: "center" },
    controlButton: { padding: 5 },
    playButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "#FF3B30", justifyContent: "center", alignItems: "center", marginHorizontal: 10
    },
})

export default memo(MiniPlayer)