"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, Image } from "react-native"
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"
import { useRouter } from "expo-router"
import { useAuth } from "@/context/AuthContext"
import PlaylistItem from "@/components/library/PlaylistItem"
import PremiumBanner from "@/components/premium/PremiumBanner"
import { useGetPlaylistByUserQuery, useGetSongsByArtistQuery } from "@/store/api"

const LibraryScreen = () => {
    const { colors, isDark } = useTheme()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("playlists")
    const [isScrolled, setIsScrolled] = useState(false)
    const scrollY = new Animated.Value(0)
    const { isAuthenticated, userId, role } = useAuth()

    if (!isAuthenticated) router.replace("/")

    const isArtist = role?.toLowerCase() === "artist"

    // Animation values
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [0, 1],
        extrapolate: "clamp",
    })

    const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
        listener: (event) => {
            const offsetY = event.nativeEvent.contentOffset.y
            setIsScrolled(offsetY > 40)
        },
    })

    // Fetch artist songs if user is an artist
    const { data: artistSongsResponse, isLoading: isLoadingArtistSongs } = useGetSongsByArtistQuery(userId as string, {
        skip: !isArtist || activeTab !== "mysongs",
    })

    const artistSongs = artistSongsResponse?.data || []

    // Fetch playlists, always call the hook to prevent conditional hook calls
    const { data: playlistResponse } = useGetPlaylistByUserQuery(userId as string)
    const playlistData = playlistResponse?.data || []

    const renderContent = () => {
        switch (activeTab) {
            case "playlists": {
                return (
                    <View style={styles.contentContainer}>
                        <TouchableOpacity
                            style={[styles.createPlaylistButton, { backgroundColor: colors.card }]}
                            onPress={() => router.push("/(playlist)/create-playlist")}
                        >
                            <View style={[styles.createPlaylistIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="add" size={24} color="#FFFFFF" />
                            </View>
                            <Text style={[styles.createPlaylistText, { color: colors.text }]}>Create Playlist</Text>
                        </TouchableOpacity>

                        {playlistData.map((playlist) => (
                            <PlaylistItem
                                key={playlist.id}
                                playlist={playlist}
                                onPress={() => router.push(`/(playlist)/${playlist.id}`)}
                            />
                        ))}
                    </View>
                )
            }

            case "mysongs": {
                if (!isArtist) {
                    return (
                        <View style={styles.emptyStateContainer}>
                            <Text style={[styles.emptyStateText, { color: colors.text }]}>
                                This feature is only available for artists
                            </Text>
                        </View>
                    )
                }

                if (isLoadingArtistSongs) {
                    return (
                        <View style={styles.loadingContainer}>
                            <Text style={[styles.loadingText, { color: colors.text }]}>Loading your songs...</Text>
                        </View>
                    )
                }

                return (
                    <View style={styles.contentContainer}>
                        <View style={[styles.artistSongsHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.artistSongsTitle, { color: colors.text }]}>My Songs</Text>
                            <TouchableOpacity
                                style={[styles.uploadButton, { backgroundColor: colors.primary }]}
                                onPress={() => router.push("/(artist)/upload")}
                            >
                                <Feather name="upload" size={16} color="#FFFFFF" />
                                <Text style={styles.uploadButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>

                        {artistSongs.length === 0 ? (
                            <View style={styles.emptyStateContainer}>
                                <MaterialIcons name="music-off" size={64} color={colors.secondary} />
                                <Text style={[styles.emptyStateText, { color: colors.text }]}>You haven't uploaded any songs yet</Text>
                                <TouchableOpacity
                                    style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                                    onPress={() => router.push("/(artist)/upload-song")}
                                >
                                    <Text style={styles.emptyStateButtonText}>Upload Your First Song</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            artistSongs.map((song) => (
                                <TouchableOpacity
                                    key={song.id}
                                    style={[styles.songItem, { backgroundColor: colors.card }]}
                                    onPress={() => router.push(`/(song)/${song.id}`)}
                                >
                                    <Image source={{ uri: song.coverImgUrl || "https://placeholder.com/400" }} style={styles.songCover} />
                                    <View style={styles.songInfo}>
                                        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>
                                            {song.title}
                                        </Text>
                                        <Text style={[styles.songMeta, { color: colors.secondary }]}>
                                            {song.streams || 0} plays • {song.createdAt}
                                        </Text>
                                    </View>
                                    <View style={styles.songActions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => router.push(`/(artist)/edit-song/${song.id}`)}
                                        >
                                            <Feather name="edit-2" size={18} color={colors.secondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <Feather name="bar-chart-2" size={18} color={colors.secondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionButton}>
                                            <Feather name="more-vertical" size={18} color={colors.secondary} />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )
            }

            default:
                return null
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Animated Header */}
            {isScrolled && (
                <Animated.View
                    style={[
                        styles.animatedHeader,
                        {
                            opacity: headerOpacity,
                            backgroundColor: colors.background,
                            borderBottomColor: colors.border,
                            borderBottomWidth: 0.5,
                        },
                    ]}
                >
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Library</Text>
                </Animated.View>
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Premium Banner (only show for non-premium users) */}
                <PremiumBanner onPress={() => router.push("/premium")} />

                {/* Library Tabs - Modified to only show playlists and mysongs (if artist) */}
                <View style={styles.tabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === "playlists" && [styles.activeTab, { backgroundColor: colors.primary + "20" }],
                            ]}
                            onPress={() => setActiveTab("playlists")}
                        >
                            <Text style={[styles.tabText, { color: activeTab === "playlists" ? colors.primary : colors.secondary }]}>
                                Playlists
                            </Text>
                        </TouchableOpacity>

                        {isArtist && (
                            <TouchableOpacity
                                style={[
                                    styles.tab,
                                    activeTab === "mysongs" && [styles.activeTab, { backgroundColor: colors.primary + "20" }],
                                ]}
                                onPress={() => setActiveTab("mysongs")}
                            >
                                <Text style={[styles.tabText, { color: activeTab === "mysongs" ? colors.primary : colors.secondary }]}>
                                    My Songs
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>

                {/* Content based on active tab */}
                {renderContent()}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    scrollContent: {
        paddingBottom: 120, // Extra padding for player bar
        paddingTop: 32,
    },
    animatedHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: Platform.OS === "ios" ? 90 : 70,
        paddingTop: Platform.OS === "ios" ? 40 : 20,
        zIndex: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    createPlaylistButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
    },
    createPlaylistIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    createPlaylistText: {
        marginLeft: 16,
        fontSize: 16,
        fontWeight: "600",
    },
    // Tabs styling
    tabsContainer: {
        marginVertical: 16,
    },
    tabs: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    activeTab: {
        borderRadius: 20,
    },
    tabText: {
        fontWeight: "600",
    },
    // Artist songs styling
    artistSongsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        marginBottom: 12,
    },
    artistSongsTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    uploadButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
    },
    songItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    songCover: {
        width: 50,
        height: 50,
        borderRadius: 4,
    },
    songInfo: {
        flex: 1,
        marginLeft: 12,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    songMeta: {
        fontSize: 12,
        marginTop: 4,
    },
    songActions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        padding: 6,
    },
    // Empty state
    emptyStateContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 16,
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: "center",
        marginTop: 8,
    },
    emptyStateButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 16,
    },
    emptyStateButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
    },
    // Loading state
    loadingContainer: {
        padding: 32,
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
    },
})

export default LibraryScreen