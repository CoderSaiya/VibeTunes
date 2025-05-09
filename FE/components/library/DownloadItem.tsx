"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"

interface DownloadItemProps {
    item: {
        id: string
        name: string
        artist: string
        album: string
        size: string
        coverUrl: string
    }
    onPress: () => void
}

const DownloadItem: React.FC<DownloadItemProps> = ({ item, onPress }) => {
    const { colors } = useTheme()

    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: colors.card }]} onPress={onPress}>
            <Image source={{ uri: item.coverUrl || "" }} style={styles.cover} />

            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.details, { color: colors.secondary }]} numberOfLines={1}>
                    {item.artist} • {item.album}
                </Text>
            </View>

            <View style={styles.rightSection}>
                <Text style={[styles.size, { color: colors.secondary }]}>{item.size}</Text>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondary} />
                </TouchableOpacity>
            </View>
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
        width: 48,
        height: 48,
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
    rightSection: {
        alignItems: "flex-end",
    },
    size: {
        fontSize: 12,
        marginBottom: 4,
    },
    moreButton: {
        padding: 4,
    },
})

export default DownloadItem