"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"
import {Song} from "@/types/song";

interface SelectedTrackItemProps {
    track: Song
    index: number
    onRemove: () => void
}

const SelectedTrackItem: React.FC<SelectedTrackItemProps> = ({ track, index, onRemove }) => {
    const { colors } = useTheme()

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <Text style={[styles.index, { color: colors.secondary }]}>{index}</Text>

            <Image source={{ uri: track.coverImgUrl }} style={styles.cover} />

            <View style={styles.info}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {track.title}
                </Text>
                <Text style={[styles.artist, { color: colors.secondary }]} numberOfLines={1}>
                    {track.artist}
                </Text>
            </View>

            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                <Ionicons name="remove-circle" size={22} color={colors.error || "#FF3B30"} />
            </TouchableOpacity>
        </View>
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
    index: {
        width: 24,
        fontSize: 14,
        fontWeight: "500",
        textAlign: "center",
    },
    cover: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginLeft: 8,
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 2,
    },
    artist: {
        fontSize: 14,
    },
    removeButton: {
        padding: 4,
    },
})

export default SelectedTrackItem