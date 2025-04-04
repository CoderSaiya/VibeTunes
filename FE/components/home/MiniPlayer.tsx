import type React from "react"
import { View, Text as RNText, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { usePlayerStore } from "@/store/playerStore"

// Rename Text to avoid conflicts
const Text = RNText

const MiniPlayer: React.FC = () => {
    const { currentSong, isPlaying, togglePlay, nextSong, prevSong } = usePlayerStore()

    if (!currentSong) return null

    return (
        <View style={styles.container}>
            <View style={styles.progressBar}>
                <View style={styles.progress} />
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={styles.collapseButton}>
                    <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <Text style={styles.songTitle} numberOfLines={1}>
                    {currentSong.title}
                </Text>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={prevSong} style={styles.controlButton}>
                        <Ionicons name="play-skip-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
                        <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={nextSong} style={styles.controlButton}>
                        <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0, // Height of the tab bar
        left: 0,
        right: 0,
        backgroundColor: "#1A1A1A",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        overflow: "hidden",
    },
    progressBar: {
        height: 2,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        width: "100%",
    },
    progress: {
        height: "100%",
        width: "30%", // This would be dynamic based on song progress
        backgroundColor: "#FF3B30",
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    collapseButton: {
        marginRight: 10,
    },
    songTitle: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "500",
    },
    controls: {
        flexDirection: "row",
        alignItems: "center",
    },
    controlButton: {
        padding: 5,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#FF3B30",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
    },
})

export default MiniPlayer