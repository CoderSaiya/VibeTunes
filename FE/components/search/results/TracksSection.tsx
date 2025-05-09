"use client"

import type React from "react"
import {View, Text, StyleSheet, TouchableOpacity, Image} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"
import {useDebounce} from "@/hooks/useDebounce";
import {useGetSongListQuery} from "@/store/api";
import {Song} from "@/types/song";

// Mock data for search results
// const TRACKS = [
//     {
//         id: "1",
//         title: "Blinding Lights",
//         artist: "The Weeknd",
//         album: "After Hours",
//         image: "https://via.placeholder.com/60",
//     },
//     {
//         id: "2",
//         title: "As It Was",
//         artist: "Harry Styles",
//         album: "Harry's House",
//         image: "https://via.placeholder.com/60",
//     },
//     {
//         id: "3",
//         title: "Stay",
//         artist: "The Kid LAROI, Justin Bieber",
//         album: "F*CK LOVE 3: OVER YOU",
//         image: "https://via.placeholder.com/60",
//     },
//     {
//         id: "4",
//         title: "Heat Waves",
//         artist: "Glass Animals",
//         album: "Dreamland",
//         image: "https://via.placeholder.com/60",
//     },
//     {
//         id: "5",
//         title: "Bad Habits",
//         artist: "Ed Sheeran",
//         album: "=",
//         image: "https://via.placeholder.com/60",
//     },
// ]

interface TracksSectionProps {
    searchQuery: string
}

const TracksSection: React.FC<TracksSectionProps> = ({ searchQuery }) => {
    const { colors } = useTheme()

    const debouncedQuery = useDebounce(searchQuery, 500);

    const { data: response, isFetching } = useGetSongListQuery({
        sortBy: "CreatedDate",
        sortDirection: "desc",
        pageSize: 8,
        titleContains: debouncedQuery || null,
    });

    const tracks = response?.data ?? [];

    if (tracks.length === 0) return null;

    // // Filter tracks based on search query
    // const filteredTracks = TRACKS.filter(
    //     (track) =>
    //         track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         track.album.toLowerCase().includes(searchQuery.toLowerCase()),
    // )

    // Render track item
    const renderTrackItem = (item : Song) => (
        <TouchableOpacity key={item.id} style={styles.trackItem}>
            <Image source={{ uri: item.coverImgUrl }} style={styles.trackImage} />
            <View style={styles.trackInfo}>
                <Text style={[styles.trackTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.trackArtist, { color: colors.text + "99" }]}>
                    {item.artist}
                </Text>
            </View>
            <TouchableOpacity style={styles.trackPlayButton}>
                <Ionicons name="play" size={20} color={colors.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    )

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Songs</Text>
                <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.tracksList}>{tracks.map((track, index) => renderTrackItem(track))}</View>
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
    tracksList: {
        marginBottom: 8,
    },
    trackItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        marginBottom: 8,
    },
    trackImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    trackInfo: {
        flex: 1,
    },
    trackTitle: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 4,
    },
    trackArtist: {
        fontSize: 14,
    },
    trackPlayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
})

export default TracksSection