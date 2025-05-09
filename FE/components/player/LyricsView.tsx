"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"

interface LyricsViewProps {
    width: number
    onBack: () => void
    songTitle: string
    artistName: string
    currentTime: number
}

// Dummy lyrics data with timestamps (in seconds)
const LYRICS_DATA = [
    { id: 1, text: "This is where the lyrics would appear", time: 0 },
    { id: 2, text: "Line by line, synced with the music", time: 10 },
    { id: 3, text: "Each line highlights as the song plays", time: 20 },
    { id: 4, text: "Making it easy to follow along", time: 30 },
    { id: 5, text: "With your favorite songs", time: 40 },
    { id: 6, text: "", time: 45 }, // Empty line for spacing
    { id: 7, text: "The lyrics would continue here", time: 50 },
    { id: 8, text: "Showing the next verse or chorus", time: 60 },
    { id: 9, text: "As the music plays through", time: 70 },
    { id: 10, text: "The app keeps everything in sync", time: 80 },
    { id: 11, text: "", time: 85 }, // Empty line for spacing
    { id: 12, text: "And when the bridge comes", time: 90 },
    { id: 13, text: "You'll see it right here", time: 100 },
    { id: 14, text: "No need to search online", time: 110 },
    { id: 15, text: "For the words to your favorite song", time: 120 },
    { id: 16, text: "", time: 125 }, // Empty line for spacing
    { id: 17, text: "The chorus might repeat again", time: 130 },
    { id: 18, text: "And you'll see it highlighted once more", time: 140 },
    { id: 19, text: "As the music continues to play", time: 150 },
    { id: 20, text: "Until the very end of the track", time: 160 },
]

const LyricsView: React.FC<LyricsViewProps> = ({ width, onBack, songTitle, artistName, currentTime }) => {
    const { colors, isDark } = useTheme()
    const scrollViewRef = useRef<ScrollView>(null)

    // Find the current lyric based on the current time
    const currentLyricIndex = LYRICS_DATA.findIndex((lyric, index) => {
        const nextLyric = LYRICS_DATA[index + 1]
        return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time)
    })

    // Scroll to the current lyric
    useEffect(() => {
        if (currentLyricIndex >= 0 && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
                y: currentLyricIndex * 50, // Approximate height of each lyric line
                animated: true,
            })
        }
    }, [currentLyricIndex])

    return (
        <View style={[styles.container, { width }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Lyrics</Text>
                </View>
                <View style={styles.headerPlaceholder} />
            </View>

            {/* Song Info */}
            <View style={styles.songInfoContainer}>
                <Text style={[styles.songTitle, { color: colors.text }]}>{songTitle}</Text>
                <Text style={[styles.artistName, { color: colors.text + "CC" }]}>{artistName}</Text>
            </View>

            {/* Lyrics */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.lyricsContainer}
                contentContainerStyle={styles.lyricsContent}
                showsVerticalScrollIndicator={false}
            >
                {LYRICS_DATA.map((lyric, index) => (
                    <View key={lyric.id} style={styles.lyricLine}>
                        <Text
                            style={[
                                styles.lyricText,
                                {
                                    color:
                                        index === currentLyricIndex
                                            ? colors.primary
                                            : index < currentLyricIndex
                                                ? colors.text + "99"
                                                : colors.text,
                                    fontWeight: index === currentLyricIndex ? "700" : "400",
                                    fontSize: index === currentLyricIndex ? 18 : 16,
                                },
                            ]}
                        >
                            {lyric.text}
                        </Text>
                    </View>
                ))}
                {/* Add extra space at the bottom for scrolling */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 15,
    },
    backButton: {
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
    headerPlaceholder: {
        width: 48, // Same width as back button for balance
    },
    songInfoContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    songTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 5,
        textAlign: "center",
    },
    artistName: {
        fontSize: 16,
        textAlign: "center",
    },
    lyricsContainer: {
        flex: 1,
    },
    lyricsContent: {
        paddingBottom: 50,
    },
    lyricLine: {
        paddingVertical: 12,
        alignItems: "center",
    },
    lyricText: {
        textAlign: "center",
        lineHeight: 24,
    },
})

export default LyricsView