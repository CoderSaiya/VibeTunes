"use client"

import type React from "react"
import { Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native"
import { useTheme } from "@/context/ThemeContext"

const { width } = Dimensions.get("window")
const ITEM_WIDTH = (width - 48) / 2 // 2 columns with padding

interface AlbumItemProps {
    album: {
        id: string
        name: string
        artist: string
        coverUrl: string
    }
    onPress: () => void
}

const AlbumItem: React.FC<AlbumItemProps> = ({ album, onPress }) => {
    const { colors } = useTheme()

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image source={{ uri: album.coverUrl || "" }} style={styles.cover} />

            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {album.name}
            </Text>
            <Text style={[styles.artist, { color: colors.secondary }]} numberOfLines={1}>
                {album.artist}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: ITEM_WIDTH,
        marginBottom: 24,
    },
    cover: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        borderRadius: 8,
        marginBottom: 8,
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 2,
    },
    artist: {
        fontSize: 12,
    },
})

export default AlbumItem