"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"
import {Song} from "@/types/song";

interface TrackSearchItemProps {
    track: Song
    onAdd: () => void
    isAdded: boolean
}

const TrackSearchItem: React.FC<TrackSearchItemProps> = ({ track, onAdd, isAdded }) => {
    const { colors } = useTheme()

    return (
        <View style={[styles.container, { borderBottomColor: colors.border }]}>
            <Image source={{ uri: track.coverImgUrl }} style={styles.cover} />

            <View style={styles.info}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                    {track.title}
                </Text>
                <Text style={[styles.artist, { color: colors.secondary }]} numberOfLines={1}>
                    {track.artist} • {track.albumTitle}
                </Text>
            </View>

            <Text style={[styles.duration, { color: colors.secondary }]}>{track.duration}</Text>

            <TouchableOpacity
                style={[styles.addButton, isAdded && { backgroundColor: "transparent" }]}
                onPress={onAdd}
                disabled={isAdded}
            >
                {isAdded ? (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                ) : (
                    <Ionicons name="add-circle-outline" size={24} color={colors.text} />
                )}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    cover: {
        width: 40,
        height: 40,
        borderRadius: 4,
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
    duration: {
        fontSize: 14,
        marginRight: 12,
    },
    addButton: {
        padding: 4,
    },
})

export default TrackSearchItem