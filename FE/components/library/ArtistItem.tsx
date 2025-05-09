"use client"

import type React from "react"
import { Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native"
import { useTheme } from "@/context/ThemeContext"

const { width } = Dimensions.get("window")
const ITEM_WIDTH = (width - 48) / 2 // 2 columns with padding

interface ArtistItemProps {
    artist: {
        id: string
        name: string
        followers: string
        imageUrl: string
    }
    onPress: () => void
}

const ArtistItem: React.FC<ArtistItemProps> = ({ artist, onPress }) => {
    const { colors } = useTheme()

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image source={{ uri: artist.imageUrl || "" }} style={styles.image} />

            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {artist.name}
            </Text>
            <Text style={[styles.followers, { color: colors.secondary }]} numberOfLines={1}>
                {artist.followers} followers
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        width: ITEM_WIDTH,
        marginBottom: 24,
        alignItems: "center",
    },
    image: {
        width: ITEM_WIDTH * 0.8,
        height: ITEM_WIDTH * 0.8,
        borderRadius: ITEM_WIDTH * 0.4, // Make it circular
        marginBottom: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 2,
        textAlign: "center",
    },
    followers: {
        fontSize: 12,
        textAlign: "center",
    },
})

export default ArtistItem