"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Share,
    Platform,
    StatusBar,
} from "react-native"
import { useLocalSearchParams, useRouter, Stack } from "expo-router"
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"

import { usePlayerStore } from "@/store/playerStore"
import {Song} from "@/types/song";
import {useDeletePlaylistMutation, useGetPlaylistByIdQuery, useGetPlaylistsQuery} from "@/store/api";
import { Playlist } from "@/types/playlist"
import {useAuth} from "@/context/AuthContext";

// Type for component props
interface PlaylistTrackItemProps {
    track: Song
    index: number
    onPlay: (track: Song) => void
    isPlaying: boolean
    isCurrentTrack: boolean
}

// PlaylistTrackItem component with proper typing
const PlaylistTrackItem: React.FC<PlaylistTrackItemProps> = ({ track, index, onPlay, isPlaying, isCurrentTrack }) => {
    return (
        <Animated.View entering={FadeInDown.delay(100 + index * 50).springify()} style={styles.trackItem}>
            <TouchableOpacity style={styles.trackItemContent} onPress={() => onPlay(track)} activeOpacity={0.7}>
                <View style={styles.trackNumberContainer}>
                    {isCurrentTrack ? (
                        <Ionicons name={isPlaying ? "pause" : "play"} size={16} color="#1DB954" />
                    ) : (
                        <Text style={styles.trackNumber}>{index + 1}</Text>
                    )}
                </View>

                <Image source={{ uri: track.coverImgUrl }} style={styles.trackCover} />

                <View style={styles.trackInfo}>
                    <Text style={[styles.trackTitle, isCurrentTrack && { color: "#1DB954" }]} numberOfLines={1}>
                        {track.title}
                        {/*{track.isExplicit && <Text style={styles.explicitLabel}> E</Text>}*/}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                        {track.artist}
                    </Text>
                </View>

                {/*<TouchableOpacity style={styles.trackAction}>*/}
                {/*    <Ionicons*/}
                {/*        name={track.isLiked ? "heart" : "heart-outline"}*/}
                {/*        size={22}*/}
                {/*        color={track.isLiked ? "#1DB954" : "#999"}*/}
                {/*    />*/}
                {/*</TouchableOpacity>*/}

                <TouchableOpacity style={styles.trackAction}>
                    <Feather name="more-vertical" size={20} color="#999" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    )
}

const PlaylistDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
    const router = useRouter()
    const [isOwner, setIsOwner] = useState(false)
    const [playlistData, setPlaylistData] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const [scrollY, setScrollY] = useState<number>(0)

    const [deletePlaylist, { isLoading: deleteLoading, isSuccess, isError }] = useDeletePlaylistMutation();

    // Player state from store
    const { currentSong, isPlaying, togglePlay, setCurrentSong } = usePlayerStore()

    useEffect(() => {
        const fetchPlaylist = () => {
            try {
                setLoading(true)
                const {data: playlistResponse, isLoading: playlistLoading, error} = useGetPlaylistByIdQuery(id);
                setPlaylistData(playlistResponse?.data as Playlist);

                const {userId} = useAuth();
                if (userId === playlistData?.userId) setIsOwner(true);
            } catch (err) {
                setError("Error fetching playlist")
                console.error("Error fetching playlist:", err)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchPlaylist()
        }
    }, [id])

    const handlePlayTrack = (track: Song) => {
        if (currentSong?.id === track.id && isPlaying) {
            togglePlay()
        }
    }

    const handlePlayAll = () => {
        // if (playlistData?.playlist.tracks.length) {
        //     playTrack(playlistData.playlist.tracks[0])
        // }
    }

    const handleLikePlaylist = async () => {
        // if (!playlistData) return
        //
        // try {
        //     await playlistService.likePlaylist(id)
        //     // Update local state to reflect the change
        //     setPlaylistData((prev) => {
        //         if (!prev) return prev
        //         return {
        //             ...prev,
        //             playlist: {
        //                 ...prev.playlist,
        //                 isLiked: !prev.playlist.isLiked,
        //             },
        //         }
        //     })
        // } catch (err) {
        //     console.error("Error liking playlist:", err)
        // }
    }

    const handleSharePlaylist = async () => {
        try {
            await Share.share({
                message: `Check out this playlist: ${playlistData?.name}`,
                url: `https://yourapp.com/playlist/${id}`,
                title: playlistData?.name,
            })
        } catch (err) {
            console.error("Error sharing playlist:", err)
        }
    }

    const handleEditPlaylist = () => {
        router.push(`/edit-playlist/${id}`)
    }

    const handleDeletePlaylist = async () => {
        try {
            await deletePlaylist({id: id})
            router.back()
        } catch (err) {
            console.error("Error deleting playlist:", err)
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
                <Text style={styles.loadingText}>Loading playlist...</Text>
            </View>
        )
    }

    if (error || !playlistData) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#ff5252" />
                <Text style={styles.errorText}>{error || "Playlist not found"}</Text>
                <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
                    <Text style={styles.errorButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const headerOpacity = Math.min(1, scrollY / 200)

    return (
        <>
            <StatusBar barStyle="light-content" />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* Animated Header */}
            <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
                <BlurView intensity={90} style={styles.blurView}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {playlistData.name}
                        </Text>

                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.headerAction}>
                                <Feather name="more-vertical" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Animated.View>

            <ScrollView
                style={styles.container}
                onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
                scrollEventThrottle={16}
            >
                {/* Playlist Header */}
                <LinearGradient
                    colors={["#1DB954", "#121212"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 0.6 }}
                    style={styles.gradientHeader}
                >
                    <TouchableOpacity style={styles.backButtonTop} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>

                    <Animated.View entering={FadeIn.delay(200).springify()} style={styles.playlistHeader}>
                        <Image source={{ uri: playlistData.coverImageUrl }} style={styles.playlistCover} />

                        <View style={styles.playlistInfo}>
                            <Text style={styles.playlistType}>PLAYLIST</Text>
                            <Text style={styles.playlistName}>{playlistData.name}</Text>

                            {playlistData.description && (
                                <Text style={styles.playlistDescription} numberOfLines={2}>
                                    {playlistData.description}
                                </Text>
                            )}

                            <View style={styles.playlistMeta}>
                                {/*<Image source={{ uri: playlistData.creator.avatarUrl }} style={styles.creatorAvatar} />*/}
                                {/*<Text style={styles.creatorName}>{playlist.creator.name}</Text>*/}
                                {/*<Text style={styles.metaDot}>•</Text>*/}
                                {/*<Text style={styles.followersCount}>*/}
                                {/*    {playlist.followers.toLocaleString()} {playlist.followers === 1 ? "follower" : "followers"}*/}
                                {/*</Text>*/}
                                <Text style={styles.metaDot}>•</Text>
                                <Text style={styles.trackCount}>
                                    {playlistData.songsList.length} {playlistData.songsList.length === 1 ? "song" : "songs"}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </LinearGradient>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {/*<TouchableOpacity style={styles.actionButton} onPress={handleLikePlaylist}>*/}
                    {/*    <Ionicons*/}
                    {/*        name={playlistData.isLiked ? "heart" : "heart-outline"}*/}
                    {/*        size={28}*/}
                    {/*        color={playlistData.isLiked ? "#1DB954" : "#fff"}*/}
                    {/*    />*/}
                    {/*</TouchableOpacity>*/}

                    <TouchableOpacity style={styles.actionButton} onPress={handleSharePlaylist}>
                        <Ionicons name="share-outline" size={28} color="#fff" />
                    </TouchableOpacity>

                    {isOwner && (
                        <TouchableOpacity style={styles.actionButton} onPress={handleEditPlaylist}>
                            <Feather name="edit-2" size={24} color="#fff" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                        <Feather name="more-vertical" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.spacer} />

                    <TouchableOpacity style={styles.playButton} onPress={handlePlayAll}>
                        <Ionicons name="play" size={30} color="#000" />
                    </TouchableOpacity>
                </View>

                {/* Tracks List */}
                <View style={styles.tracksContainer}>
                    {playlistData.songsList.map((track, index) => (
                        <PlaylistTrackItem
                            key={track.id}
                            track={track}
                            index={index}
                            onPlay={handlePlayTrack}
                            isPlaying={isPlaying && currentSong?.id === track.id}
                            isCurrentTrack={currentSong?.id === track.id}
                        />
                    ))}
                </View>

                {/* Playlist Footer */}
                <View style={styles.playlistFooter}>
                    <Text style={styles.footerText}>
                        {/*Created by {playlistData.creator.name} • {playlistData.createdDate}*/}
                    </Text>

                    {isOwner && (
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePlaylist}>
                            <Feather name="trash-2" size={16} color="#ff5252" />
                            <Text style={styles.deleteButtonText}>Delete Playlist</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Bottom padding for player */}
                <View style={styles.bottomPadding} />
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
    },
    loadingText: {
        color: "#fff",
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
        padding: 20,
    },
    errorText: {
        color: "#fff",
        fontSize: 18,
        marginTop: 16,
        textAlign: "center",
    },
    errorButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#1DB954",
        borderRadius: 24,
    },
    errorButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "600",
    },
    animatedHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: Platform.OS === "ios" ? 90 : 70,
        paddingTop: Platform.OS === "ios" ? 40 : 20,
    },
    blurView: {
        flex: 1,
        overflow: "hidden",
    },
    headerContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 16,
    },
    headerRight: {
        flexDirection: "row",
    },
    headerAction: {
        padding: 8,
    },
    gradientHeader: {
        paddingTop: Platform.OS === "ios" ? 50 : 30,
        paddingBottom: 20,
    },
    backButtonTop: {
        position: "absolute",
        top: Platform.OS === "ios" ? 50 : 30,
        left: 16,
        zIndex: 10,
        padding: 4,
    },
    playlistHeader: {
        padding: 16,
        marginTop: 30,
    },
    playlistCover: {
        width: 180,
        height: 180,
        borderRadius: 8,
        alignSelf: "center",
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    playlistInfo: {
        alignItems: "center",
    },
    playlistType: {
        color: "#ccc",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
    },
    playlistName: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    playlistDescription: {
        color: "#ccc",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    playlistMeta: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    creatorAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    creatorName: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    metaDot: {
        color: "#ccc",
        marginHorizontal: 8,
    },
    followersCount: {
        color: "#ccc",
        fontSize: 14,
    },
    trackCount: {
        color: "#ccc",
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    actionButton: {
        padding: 8,
        marginRight: 16,
    },
    spacer: {
        flex: 1,
    },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#1DB954",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#1DB954",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    tracksContainer: {
        paddingHorizontal: 16,
    },
    trackItem: {
        marginBottom: 12,
    },
    trackItemContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },
    trackNumberContainer: {
        width: 30,
        alignItems: "center",
    },
    trackNumber: {
        color: "#999",
        fontSize: 16,
    },
    trackCover: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 12,
    },
    trackInfo: {
        flex: 1,
        justifyContent: "center",
    },
    trackTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 4,
    },
    explicitLabel: {
        color: "#999",
        fontSize: 14,
        fontWeight: "600",
    },
    trackArtist: {
        color: "#999",
        fontSize: 14,
    },
    trackAction: {
        padding: 8,
    },
    playlistFooter: {
        padding: 24,
        alignItems: "center",
    },
    footerText: {
        color: "#999",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    deleteButtonText: {
        color: "#ff5252",
        fontSize: 14,
        fontWeight: "500",
        marginLeft: 8,
    },
    bottomPadding: {
        height: 100,
    },
})

export default PlaylistDetailScreen