"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"
import {Playlist} from "@/types/playlist";

interface PlaylistItemProps {
    playlist: Playlist
    onPress: () => void
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ playlist, onPress }) => {
    const { colors } = useTheme()

    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: colors.card }]} onPress={onPress}>
            <Image source={{ uri: playlist.coverImageUrl || "" }} style={styles.cover}/>

            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {playlist.name}
                </Text>
                <Text style={[styles.details, { color: colors.secondary }]}>
                    {"Your playlist"} • {playlist.songsList.length} tracks
                </Text>
            </View>

            <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondary} />
            </TouchableOpacity>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    cover: {
        width: 56,
        height: 56,
        borderRadius: 4,
    },
    info: {
        flex: 1,
        marginLeft: 16,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    details: {
        fontSize: 14,
    },
    moreButton: {
        padding: 8,
    },
})

export default PlaylistItem