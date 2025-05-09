"use client"

import React, {useEffect} from "react"
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ListRenderItemInfo} from "react-native"
import { useTheme } from "@/context/ThemeContext"
import {useGetAlbumsQuery} from "@/store/api";
import {Album} from "@/types/album";
import {useDebounce} from "@/hooks/useDebounce";

// Mock data for albums
// const ALBUMS : AlbumSearchItem[] = [
//     {
//         id: "1",
//         title: "After Hours",
//         artist: "The Weeknd",
//         coverImageUri: "https://via.placeholder.com/120",
//     },
//     {
//         id: "2",
//         title: "Harry's House",
//         artist: "Harry Styles",
//         coverImageUri: "https://via.placeholder.com/120",
//     },
//     {
//         id: "3",
//         title: "Midnights",
//         artist: "Taylor Swift",
//         coverImageUri: "https://via.placeholder.com/120",
//     },
// ]

interface AlbumsSectionProps {
    searchQuery: string
}

const AlbumsSection: React.FC<AlbumsSectionProps> = ({ searchQuery }) => {
    const { colors } = useTheme()

    const debouncedQuery = useDebounce(searchQuery, 500);

    const { data: response, isFetching } = useGetAlbumsQuery({
        sortBy: "CreatedDate",
        sortDirection: "desc",
        pageSize: 10,
        keyword: debouncedQuery || null,
    });

    const albums = response?.data ?? [];

    if (!albums.length) return null;

    // // Filter albums based on search query
    // const filteredAlbums = albumData?.filter(
    //     (album) =>
    //         album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         album.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         album.artist.toLowerCase().includes(searchQuery.toLowerCase()),
    // )

    // Render album item
    const renderAlbumItem = ({ item }: ListRenderItemInfo<Album>) => (
        <TouchableOpacity style={styles.albumItem}>
            <Image source={{ uri: item.coverImgUrl }} style={styles.albumImage} />
            <Text
                style={[styles.albumTitle, { color: colors.text }]}
                numberOfLines={1}
            >
                {item.title}
            </Text>
            <Text
                style={[styles.albumArtist, { color: colors.text + "99" }]}
                numberOfLines={1}
            >
                {item.artist}
            </Text>
        </TouchableOpacity>
    );

    // if (filteredAlbums?.length === 0) return null

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Albums</Text>
                <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
            </View>
            {isFetching ? (
                <Text style={{ color: colors.text }}>Loading…</Text>
            ) : (
                <FlatList
                    data={albums}
                    renderItem={renderAlbumItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalListContent}
                />
            )}
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
    albumItem: {
        marginRight: 16,
        width: 140,
    },
    albumImage: {
        width: 140,
        height: 140,
        borderRadius: 8,
        marginBottom: 8,
    },
    albumTitle: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 2,
    },
    albumArtist: {
        fontSize: 12,
    },
})

export default AlbumsSection