"use client"

import type React from "react"
import { View, Text as RNText, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"

// Rename Text to avoid conflicts
const Text = RNText

interface Song {
    id: string
    title: string
    artist: string
    image: string
}

interface LatestSectionProps {
    title: string
    data: Song[]
    onSeeAllPress: () => void
    onSongPress: (song: Song) => void
}

const LatestSection: React.FC<LatestSectionProps> = ({ title, data, onSeeAllPress, onSongPress }) => {
    const { colors } = useTheme()

    const renderItem = ({ item }: { item: Song }) => {
        return (
            <TouchableOpacity style={styles.songContainer} onPress={() => onSongPress(item)}>
                <Image source={{ uri: item.image }} style={styles.songImage} />
                <View style={styles.playOverlay}>
                    <Ionicons name="play" size={24} color="#FFFFFF" />
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <TouchableOpacity onPress={onSeeAllPress} style={styles.seeAllButton}>
                    <Ionicons name="arrow-forward" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
    },
    seeAllButton: {
        padding: 5,
    },
    listContent: {
        paddingHorizontal: 15,
    },
    songContainer: {
        marginHorizontal: 8,
        width: 150,
        height: 150,
        borderRadius: 8,
        overflow: "hidden",
    },
    songImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    playOverlay: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -12 }, { translateY: -12 }],
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default LatestSection