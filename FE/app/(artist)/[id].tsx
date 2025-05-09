"use client"

import { useLocalSearchParams, useRouter } from "expo-router"
import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Animated,
    Dimensions,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ChevronLeft, Heart, MoreVertical, Play, Share2 } from "lucide-react-native"
import {useTheme} from "@/context/ThemeContext";
import ArtistPopularTracks from "@/components/artist/ArtistPopularTracks";
import ArtistAlbums from "@/components/artist/ArtistAlbum";
import ArtistBio from "@/components/artist/ArtistBio";
import {useFollowArtistMutation, useGetArtistProfileQuery} from "@/store/api";
import {ArtistProfile} from "@/types/user";
import {useAuth} from "@/context/AuthContext";

const { width } = Dimensions.get("window")
const HEADER_MAX_HEIGHT = 350
const HEADER_MIN_HEIGHT = 100
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

export default function ArtistDetailScreen() {
    const { colors, isDark } = useTheme()
    const insets = useSafeAreaInsets()
    const router = useRouter()
    const params = useLocalSearchParams()
    const { id, name } = params
    const {userId} = useAuth()

    // Call the hook at the component level, not inside useEffect
    const { data: artistResponse, isLoading, refetch } = useGetArtistProfileQuery(id.toString())
    const [followArtist] = useFollowArtistMutation()

    const [artist, setArtist] = useState<ArtistProfile | null>(null)
    const scrollY = new Animated.Value(0)

    // Update artist state when data changes
    useEffect(() => {
        if (artistResponse?.data) {
            setArtist(artistResponse.data as ArtistProfile)
        }
    }, [artistResponse])

    // Animated values for header
    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    })

    // Calculate dynamic padding to prevent content from overlapping the minimized header
    const contentPaddingTop = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT + insets.top],
        extrapolate: 'clamp',
    })

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 0.5, 0],
        extrapolate: 'clamp',
    })

    const titleOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [0, 0.5, 1],
        extrapolate: 'clamp',
    })

    const handleFollow = async () => {
        if (!artist) return
        try {
            await followArtist({
                userId: userId as string,
                artistId: id.toString()
            })

            refetch()
        }catch (err) {
            console.error("Error following artist:", err)
        }
    }

    if (isLoading || !artist) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Loading...</Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Animated Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        height: headerHeight,
                        backgroundColor: colors.card,
                    }
                ]}
            >
                <Animated.Image
                    source={{ uri: artist.avatar as string }}
                    style={[
                        styles.headerImage,
                        { opacity: headerOpacity }
                    ]}
                />
                <View style={[styles.headerOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.3)' }]} />

                {/* Back button */}
                <TouchableOpacity
                    style={[styles.backButton, { top: insets.top + 10 }]}
                    onPress={() => router.back()}
                >
                    <ChevronLeft color="#fff" size={24} />
                </TouchableOpacity>

                {/* Artist name in header (visible when scrolled) */}
                <Animated.View
                    style={[
                        styles.headerTitle,
                        {
                            opacity: titleOpacity,
                            top: insets.top + 10
                        }
                    ]}
                >
                    <Text style={styles.headerTitleText}>{artist?.stageName}</Text>
                </Animated.View>
            </Animated.View>

            {/* Content */}
            <Animated.ScrollView
                contentContainerStyle={{
                    paddingTop: HEADER_MAX_HEIGHT,
                    paddingBottom: insets.bottom + 20 // Add bottom padding for safe area
                }}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                // Add padding to the bottom of the content to ensure the header isn't covered
                contentInsetAdjustmentBehavior="scrollableAxes"
            >
                {/* Artist Info */}
                <View style={styles.artistInfoContainer}>
                    <Text style={[styles.artistName, { color: colors.text }]}>{artist?.stageName}</Text>
                    <Text style={[styles.artistStats, { color: colors.secondary }]}>
                        {artist?.followers} followers
                    </Text>

                    {/* Action buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={[styles.followButton, { backgroundColor: colors.primary }]} onPress={handleFollow}>
                            <Text style={styles.followButtonText}>Follow</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary }]}>
                            <Play color={colors.playerText} size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary }]}>
                            <Heart color={colors.playerText} size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary }]}>
                            <Share2 color={colors.playerText} size={20} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: colors.primary }]}>
                            <MoreVertical color={colors.playerText} size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Popular Tracks */}
                <ArtistPopularTracks tracks={artist?.popularSongs ?? []} />

                {/* Albums */}
                <ArtistAlbums albums={artist?.albums ?? []} />

                {/*/!* Similar Artists *!/*/}
                {/*<ArtistSimilar artists={artist.similarArtists} />*/}

                {/* Biography */}
                <ArtistBio bio={artist?.bio as string} />

                {/* Bottom padding */}
                <View style={{ height: 100 }} />
            </Animated.ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        zIndex: 10,
    },
    headerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    headerOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    backButton: {
        position: 'absolute',
        left: 15,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    headerTitle: {
        position: 'absolute',
        left: 70,
        right: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    artistInfoContainer: {
        padding: 20,
    },
    artistName: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    artistStats: {
        fontSize: 14,
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    followButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 30,
        marginRight: 10,
    },
    followButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
})