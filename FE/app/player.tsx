"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, memo } from "react"
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Animated,
    PanResponder,
    SafeAreaView,
    StatusBar,
    BackHandler,
} from "react-native"
import Slider from "@react-native-community/slider"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"
import { usePlayerStore } from "@/store/playerStore"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import LyricsView from "@/components/player/LyricsView"
import { useRouter } from "expo-router"

const { width, height } = Dimensions.get("window")

// Custom hook to get player state with memoization
const usePlayerState = () => {
    const currentSong = usePlayerStore((state) => state.currentSong)
    const isPlaying = usePlayerStore((state) => state.isPlaying)
    const progress = usePlayerStore((state) => state.progress || 0)
    const duration = usePlayerStore((state) => state.duration || 210)
    const currentTime = usePlayerStore((state) => state.currentTime || 0)
    const repeatMode = usePlayerStore((state) => state.repeatMode)
    const shuffleMode = usePlayerStore((state) => state.shuffleMode)

    // Get actions from store
    const togglePlay = usePlayerStore((state) => state.togglePlay)
    const nextSong = usePlayerStore((state) => state.nextSong)
    const prevSong = usePlayerStore((state) => state.prevSong)
    const setPlayerScreenVisible = usePlayerStore((state) => state.setPlayerScreenVisible)
    const toggleRepeatMode = usePlayerStore((state) => state.toggleRepeatMode)
    const toggleShuffleMode = usePlayerStore((state) => state.toggleShuffleMode)
    const seekTo = usePlayerStore((state) => state.seekTo)

    return {
        currentSong,
        isPlaying,
        progress,
        duration,
        currentTime,
        repeatMode,
        shuffleMode,
        togglePlay,
        nextSong,
        prevSong,
        setPlayerScreenVisible,
        toggleRepeatMode,
        toggleShuffleMode,
        seekTo,
    }
}

// Memoized format time function
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

const PlayerScreen: React.FC = () => {
    const { colors, isDark } = useTheme()
    const insets = useSafeAreaInsets()
    const router = useRouter()

    // Use our custom hook to get player state
    const {
        currentSong,
        isPlaying,
        progress: storeProgress,
        duration: storeDuration,
        currentTime: storeCurrentTime,
        repeatMode,
        shuffleMode,
        togglePlay,
        nextSong,
        prevSong,
        setPlayerScreenVisible,
        toggleRepeatMode,
        toggleShuffleMode,
        seekTo,
    } = usePlayerState()

    // Keep local state for UI to avoid frequent re-renders from store updates
    const [currentProgress, setCurrentProgress] = useState(storeProgress)
    const [duration, setDuration] = useState(storeDuration)
    const [currentTime, setCurrentTime] = useState(Math.floor(storeDuration * storeProgress))
    const [isSliding, setIsSliding] = useState(false)
    const [isLiked, setIsLiked] = useState(false)

    // Animation refs
    const slideAnim = useRef(new Animated.Value(0)).current
    const [showLyrics, setShowLyrics] = useState(false)
    const scrollY = useRef(new Animated.Value(0)).current

    // useRefs for previous values
    const prevProgressRef = useRef(currentProgress)
    const prevDurationRef = useRef(duration)
    const prevTimeRef = useRef(currentTime)

    // Update local state when store values change, but only if we're not sliding
    useEffect(() => {
        // Only update if not sliding and if values have actually changed
        if (!isSliding) {
            const shouldUpdateProgress = Math.abs(prevProgressRef.current - storeProgress) > 0.01
            const shouldUpdateDuration = Math.abs(prevDurationRef.current - storeDuration) > 0.1
            const shouldUpdateTime = Math.abs(prevTimeRef.current - storeCurrentTime) > 0.5

            if (shouldUpdateProgress) {
                setCurrentProgress(storeProgress)
                prevProgressRef.current = storeProgress
            }

            if (shouldUpdateDuration) {
                setDuration(storeDuration)
                prevDurationRef.current = storeDuration
            }

            if (shouldUpdateTime) {
                setCurrentTime(Math.floor(storeCurrentTime))
                prevTimeRef.current = storeCurrentTime
            }
        }
    }, [storeProgress, storeDuration, storeCurrentTime, isSliding])

    // Track if we're on the PlayerScreen to hide the MiniPlayer
    useEffect(() => {
        // Mark player screen as visible
        setPlayerScreenVisible(true)

        // Add back button handler for Android
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            handleGoBack()
            return true
        })

        // Cleanup when screen unmounts
        return () => {
            setPlayerScreenVisible(false)
            backHandler.remove()
        }
    }, [])

    // Pan responder for sliding between player and lyrics - memoized to prevent recreating on each render
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                // Only allow horizontal sliding
                if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
                    // Limit the animation value between -width and 0
                    const newValue = Math.max(-width, Math.min(0, gestureState.dx))
                    slideAnim.setValue(newValue)
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                // If swiped left significantly, show lyrics
                if (gestureState.dx < -width / 3) {
                    Animated.spring(slideAnim, {
                        toValue: -width,
                        useNativeDriver: true,
                        bounciness: 0,
                    }).start(() => setShowLyrics(true))
                }
                // Otherwise, return to player view
                else {
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 0,
                    }).start(() => setShowLyrics(false))
                }
            },
        }),
    ).current

    // Handle slider change - memoized to prevent recreating on each render
    const handleSliderChange = useCallback(
        (value: number) => {
            // Update local state immediately for UI responsiveness
            setCurrentProgress(value)
            setCurrentTime(Math.floor(duration * value))
        },
        [duration],
    )

    // Handle slider complete - only update the store when the user finishes sliding
    const handleSliderComplete = useCallback(
        (value: number) => {
            setIsSliding(false)
            // Schedule the update outside the render cycle
            setTimeout(() => {
                seekTo(value)
            }, 0)
        },
        [seekTo],
    )

    // Handle slider start - mark that we're sliding to prevent store updates
    const handleSliderStart = useCallback(() => {
        setIsSliding(true)
    }, [])

    // Handle returning from lyrics view
    const handleReturnFromLyrics = useCallback(() => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
        }).start(() => setShowLyrics(false))
    }, [slideAnim])

    // Handle going back to previous screen
    const handleGoBack = useCallback(() => {
        router.back()
    }, [router])

    // Handle like song
    const toggleLike = useCallback(() => {
        setIsLiked((prev) => !prev)
    }, [])

    // Show a message if no song is playing
    if (!currentSong) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.noSongText, { color: colors.text }]}>No song is currently playing</Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <Animated.View
                style={[styles.contentContainer, { transform: [{ translateX: slideAnim }] }]}
                {...panResponder.panHandlers}
            >
                {/* Player View */}
                <View style={[styles.playerContainer, { width }]}>
                    {/* Header */}
                    <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : 20 }]}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleGoBack}>
                            <Ionicons name="chevron-down" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>Now Playing</Text>
                        </View>
                        <TouchableOpacity style={styles.headerButton}>
                            <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Album Art */}
                    <View style={styles.albumContainer}>
                        <Image
                            source={{ uri: currentSong.coverImgUrl || "https://via.placeholder.com/400" }}
                            style={styles.albumArt}
                        />
                    </View>

                    {/* Song Info */}
                    <View style={styles.songInfoContainer}>
                        <Text style={[styles.songTitle, { color: colors.text }]}>{currentSong.title}</Text>
                        <Text style={[styles.artistName, { color: colors.text + "CC" }]}>{currentSong.artist}</Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <Slider
                            style={styles.progressBar}
                            value={currentProgress}
                            onValueChange={handleSliderChange}
                            onSlidingStart={handleSliderStart}
                            onSlidingComplete={handleSliderComplete}
                            minimumValue={0}
                            maximumValue={1}
                            minimumTrackTintColor={colors.primary}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.primary}
                        />
                        <View style={styles.timeContainer}>
                            <Text style={[styles.timeText, { color: colors.text + "CC" }]}>{formatTime(currentTime)}</Text>
                            <Text style={[styles.timeText, { color: colors.text + "CC" }]}>{formatTime(duration)}</Text>
                        </View>
                    </View>

                    {/* Controls */}
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity style={styles.secondaryControlButton} onPress={toggleShuffleMode}>
                            <Ionicons name="shuffle" size={24} color={shuffleMode ? colors.primary : colors.text + "CC"} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlButton} onPress={prevSong}>
                            <Ionicons name="play-skip-back-sharp" size={24} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
                            <LinearGradient
                                colors={[colors.primary, colors.primary + "CC"]}
                                style={styles.playButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons
                                    name={isPlaying ? "pause" : "play"}
                                    size={30}
                                    color="#FFFFFF"
                                    style={isPlaying ? {} : { marginLeft: 4 }}
                                />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlButton} onPress={nextSong}>
                            <Ionicons name="play-skip-forward-sharp" size={24} color={colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryControlButton} onPress={toggleRepeatMode}>
                            <Ionicons
                                name={repeatMode === "one" ? "repeat-one" : "repeat"}
                                size={24}
                                color={repeatMode !== "off" ? colors.primary : colors.text + "CC"}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Additional Controls */}
                    <View style={styles.additionalControlsContainer}>
                        <TouchableOpacity style={styles.additionalControlButton} onPress={toggleLike}>
                            <Ionicons
                                name={isLiked ? "heart" : "heart-outline"}
                                size={24}
                                color={isLiked ? colors.primary : colors.text + "CC"}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.additionalControlButton}>
                            <MaterialIcons name="playlist-add" size={28} color={colors.text + "CC"} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.additionalControlButton}>
                            <Ionicons name="share-outline" size={24} color={colors.text + "CC"} />
                        </TouchableOpacity>
                    </View>

                    {/* Lyrics Indicator */}
                    <TouchableOpacity
                        style={styles.lyricsIndicator}
                        onPress={() => {
                            Animated.spring(slideAnim, {
                                toValue: -width,
                                useNativeDriver: true,
                                bounciness: 0,
                            }).start(() => setShowLyrics(true))
                        }}
                    >
                        <Text style={[styles.lyricsText, { color: colors.primary }]}>Lyrics</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Lyrics View */}
                <LyricsView
                    width={width}
                    onBack={handleReturnFromLyrics}
                    songTitle={currentSong.title}
                    artistName={currentSong.artist}
                    currentTime={currentTime}
                />
            </Animated.View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        flexDirection: "row",
        width: width * 2,
    },
    playerContainer: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 20,
    },
    header: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    headerButton: {
        padding: 10,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    albumContainer: {
        marginVertical: 30,
        width: width - 80,
        height: width - 80,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    albumArt: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
    },
    songInfoContainer: {
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
    },
    songTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 5,
        textAlign: "center",
    },
    artistName: {
        fontSize: 16,
        textAlign: "center",
    },
    progressContainer: {
        width: "100%",
        marginBottom: 20,
    },
    progressBar: {
        width: "100%",
        height: 40,
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 5,
    },
    timeText: {
        fontSize: 12,
    },
    controlsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "80%",
        marginBottom: 30,
    },
    secondaryControlButton: {
        padding: 10,
    },
    controlButton: {
        padding: 10,
    },
    playButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    playButtonGradient: {
        width: "100%",
        height: "100%",
        borderRadius: 35,
        justifyContent: "center",
        alignItems: "center",
    },
    additionalControlsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "60%",
        marginBottom: 20,
    },
    additionalControlButton: {
        padding: 10,
    },
    lyricsIndicator: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    lyricsText: {
        fontSize: 16,
        fontWeight: "600",
        marginRight: 5,
    },
    noSongText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 100,
    },
})

export default memo(PlayerScreen)