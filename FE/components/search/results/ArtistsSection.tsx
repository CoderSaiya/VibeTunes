"use client"

import type React from "react"
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ListRenderItemInfo} from "react-native"
import { useTheme } from "@/context/ThemeContext"
import {ArtistSearchItem} from "@/types";
import {useDebounce} from "@/hooks/useDebounce";
import {useGetSongListQuery, useGetUserListQuery} from "@/store/api";
import {Artist} from "@/types/user";
import {useRouter} from "expo-router";

// Mock data for artists
// const ARTISTS : ArtistSearchItem[] = [
//     {
//         id: "1",
//         name: "The Weeknd",
//         avatar: "https://via.placeholder.com/80",
//     },
//     {
//         id: "2",
//         name: "Taylor Swift",
//         avatar: "https://via.placeholder.com/80",
//     },
//     {
//         id: "3",
//         name: "Drake",
//         avatar: "https://via.placeholder.com/80",
//     },
//     {
//         id: "4",
//         name: "Billie Eilish",
//         avatar: "https://via.placeholder.com/80",
//     },
// ]

interface ArtistsSectionProps {
    searchQuery: string
}

const ArtistsSection: React.FC<ArtistsSectionProps> = ({ searchQuery }) => {
    const { colors } = useTheme()
    const router = useRouter();

    const debouncedQuery = useDebounce(searchQuery, 500);

    const { data: response, isFetching } = useGetUserListQuery({
        sortBy: "CreatedDate",
        sortDirection: "desc",
        pageSize: 10,
        name: debouncedQuery || null,
        isArtist: true,
        isActive: true,
    });

    const artists = response?.data as Artist[] ?? [];

    if (artists.length === 0) return null;

    const handlerClick = (artistId: string) => {
        router.push(`/(artist)/${artistId}`)
    }

    // Filter artists based on search query
    // const filteredArtists = ARTISTS.filter((artist) => artist.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Render artist item
    const renderArtistItem = ({ item } : ListRenderItemInfo<Artist>) => (
        <TouchableOpacity style={styles.artistItem} onPress={() => handlerClick(item.id)}>
            <Image source={{ uri: item.avatar }} style={styles.artistImage} />
            <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>
                {item.stageName}
            </Text>
        </TouchableOpacity>
    )

    // if (filteredArtists.length === 0) return null

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Artists</Text>
                <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={artists}
                renderItem={renderArtistItem}
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
    artistItem: {
        marginRight: 16,
        alignItems: "center",
        width: 80,
    },
    artistImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
    },
    artistName: {
        fontSize: 14,
        textAlign: "center",
    },
})

export default ArtistsSection