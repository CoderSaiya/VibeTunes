"use client"

import type React from "react"
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import {useTheme} from "@/context/ThemeContext";

interface Artist {
    id: string
    name: string
    image: string
}

interface ArtistSectionProps {
    title: string
    data: Artist[]
    onSeeAllPress: () => void
    onArtistPress: (artist: Artist) => void
}

const ArtistSection: React.FC<ArtistSectionProps> = ({ title, data, onSeeAllPress, onArtistPress }) => {
    const { colors } = useTheme()

    const renderItem = ({ item }: { item: Artist }) => {
        return (
            <TouchableOpacity style={styles.artistContainer} onPress={() => onArtistPress(item)}>
                <Image source={{ uri: item.image }} style={styles.artistImage} />
                <Text style={[styles.artistName, { color: colors.text }]}>{item.name}</Text>
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
    artistContainer: {
        alignItems: "center",
        marginHorizontal: 10,
        width: 100,
    },
    artistImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    artistName: {
        marginTop: 8,
        textAlign: "center",
        fontSize: 14,
    },
})

export default ArtistSection