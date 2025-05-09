"use client"

import type React from "react"
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ListRenderItemInfo} from "react-native"
import { useTheme } from "@/context/ThemeContext"
import {useDebounce} from "@/hooks/useDebounce";
import {useGetPlaylistsQuery} from "@/store/api";
import {Playlist} from "@/types/playlist";

// Mock data for playlists
// const PLAYLISTS = [
//     {
//         id: "1",
//         title: "Today's Top Hits",
//         description: "The most popular songs right now",
//         image: "https://via.placeholder.com/120",
//     },
//     {
//         id: "2",
//         title: "Chill Vibes",
//         description: "Relaxing music for your day",
//         image: "https://via.placeholder.com/120",
//     },
//     {
//         id: "3",
//         title: "Workout Essentials",
//         description: "Energy-boosting tracks for your workout",
//         image: "https://via.placeholder.com/120",
//     },
// ]

interface PlaylistsSectionProps {
    searchQuery: string
}

const PlaylistsSection: React.FC<PlaylistsSectionProps> = ({ searchQuery }) => {
    const { colors } = useTheme()

    const debouncedQuery = useDebounce(searchQuery, 500);

    const { data: response, isFetching } = useGetPlaylistsQuery({
        sortBy: "CreatedDate",
        sortDirection: "desc",
        pageSize: 10,
        keyword: debouncedQuery || null,
        isPublic: true,
    });

    const playlists = response?.data ?? [];

    if (playlists.length === 0) return null;

    // // Filter playlists based on search query
    // const filteredPlaylists = PLAYLISTS.filter(
    //     (playlist) =>
    //         playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         playlist.description.toLowerCase().includes(searchQuery.toLowerCase()),
    // )

    // Render playlist item
    const renderPlaylistItem = ({ item } : ListRenderItemInfo<Playlist>) => (
        <TouchableOpacity style={styles.playlistItem}>
            <Image source={{ uri: item.coverImageUrl }} style={styles.playlistImage} />
            <Text style={[styles.playlistTitle, { color: colors.text }]} numberOfLines={1}>
                {item.name}
            </Text>
            <Text style={[styles.playlistDescription, { color: colors.text + "99" }]} numberOfLines={1}>
                {item.description}
            </Text>
        </TouchableOpacity>
    )

    // if (filteredPlaylists.length === 0) return null

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Playlists</Text>
                <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={playlists}
                renderItem={renderPlaylistItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: "500",
    },
    horizontalListContent: {
        paddingRight: 16,
    },
    playlistItem: {
        marginRight: 16,
        width: 160,
    },
    playlistImage: {
        width: 160,
        height: 160,
        borderRadius: 8,
        marginBottom: 8,
    },
    playlistTitle: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 2,
    },
    playlistDescription: {
        fontSize: 12,
    },
})

export default PlaylistsSection