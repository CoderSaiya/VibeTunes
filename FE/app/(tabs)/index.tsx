import {ScrollView, Text, StyleSheet, TouchableOpacity, View, SafeAreaView, RefreshControl} from 'react-native';
import {StatusBar} from "expo-status-bar";
import {useTheme} from "@/context/ThemeContext";
import {Ionicons} from "@expo/vector-icons";
import {usePlayerStore} from "@/store/playerStore";
import ArtistSection from "@/components/home/ArtistSection";
import LatestSection from "@/components/home/LatestSection";
import Carousel from "@/components/home/Carousel";
import HotSongSection from "@/components/home/HotSongSection";
import {
    useGetPlaylistsQuery,
    useGetRecommendSongQuery,
    useGetSongListQuery,
    useGetUserListQuery,
    useLogSongMutation
} from "@/store/api";
import {Song} from "@/types/song";
import {Artist} from "@/types/user";
import {Playlist} from "@/types/playlist";
import {useCallback, useState} from "react";
import {useAuth} from "@/context/AuthContext";

export default function HomeScreen() {
    const {colors, toggleTheme, isDark} = useTheme()
    const {setCurrentSong} = usePlayerStore()
    const [refreshing, setRefreshing] = useState(false)
    const {isAuthenticated, userId} = useAuth()

    const {
        data: latestData,
        refetch: refetchLatest,
        isLoading: isLatestLoading
    } = useGetSongListQuery({
        sortBy: "CreatedDate",
        sortDirection: "desc",
        pageSize: 5,
    });

    const {
        data: artistsData,
        refetch: refetchArtists,
        isLoading: isArtistsLoading
    } = useGetUserListQuery({
        sortBy: "CreatedDate",
        sortDirection: "desc",
        pageSize: 5,
        isArtist: true,
    });

    const {
        data: carouselData,
        refetch: refetchCarousel,
        isLoading: isCarouselLoading
    } = useGetPlaylistsQuery({
        sortBy: "CreatedDate",
        sortDirection: "desc",
        pageSize: 5,
        isPublic: true,
    });

    const {
        data: recommendData,
        refetch: refetchRecommend,
        isLoading: isRecommendLoading
    } = useGetRecommendSongQuery(userId as string, {
        skip: !isAuthenticated || !userId
    });

    const [logSong] = useLogSongMutation();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const refreshPromises = [
                refetchLatest(),
                refetchArtists(),
                refetchCarousel()
            ];

            // Only refresh recommendations if user is logged in
            if (isAuthenticated && userId) {
                refreshPromises.push(refetchRecommend());
            }

            await Promise.all(refreshPromises);
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setRefreshing(false);
        }
    }, [refetchLatest, refetchArtists, refetchCarousel, refetchRecommend, isAuthenticated, userId]);

    const handleArtistPress = (artist: any) => {
        console.log("Artist pressed:", artist)
        // Navigate to artist details
    }

    const handleSeeAllPress = (section: string) => {
        console.log("See all pressed for section:", section)
        // Navigate to section list
    }

    const handleCarouselItemPress = (item: any) => {
        console.log("Carousel item pressed:", item)
        // Handle carousel item press
    }

    const handleSongPress = (song: Song) => {
        console.log("Song pressed:", song)
        setCurrentSong({
            id: song.id,
            title: song.title,
            artist: song.artist,
            genre: song.genre,
            duration: song.duration,
            releaseDate: song.releaseDate,
            coverImgUrl: song.coverImgUrl,
            fileUrl: song.fileUrl,
            streams: song.streams,
            createdAt: song.createdAt,
            albumTitle: song.albumTitle,
        })

        if (isAuthenticated && userId)
            logSong({
                userId: userId,
                songId: song.id
            }).then(
                () => console.log("Song logged successfully")
            ).catch(
                (error) => console.error("Error logging song:", error)
            )

        console.log("Current song after update:", usePlayerStore.getState().currentSong)
    }

    const isLoading = isLatestLoading || isArtistsLoading || isCarouselLoading ||
        (isAuthenticated && userId && isRecommendLoading);

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <StatusBar style={isDark ? 'light' : 'dark'}/>

            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="menu" size={28} color={colors.text}/>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, {color: colors.text}]}>Home</Text>
                <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
                    <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={colors.text}/>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]} // Android
                        tintColor={colors.primary} // iOS
                        title="Pull to refresh..." // iOS
                        titleColor={colors.text} // iOS
                    />
                }
            >
                {carouselData?.data && (
                    <Carousel
                        data={carouselData.data as Playlist[]}
                        onItemPress={handleCarouselItemPress}
                    />
                )}

                {artistsData?.data && (
                    <ArtistSection
                        title="Artist"
                        data={artistsData.data as Artist[]}
                        onSeeAllPress={() => handleSeeAllPress("artists")}
                        onArtistPress={handleArtistPress}
                    />
                )}

                {latestData?.data && (
                    <LatestSection
                        title="Latest"
                        data={latestData.data}
                        onSeeAllPress={() => handleSeeAllPress("latest")}
                        onSongPress={handleSongPress}
                    />
                )}

                {isAuthenticated && userId && recommendData?.data && (
                    <HotSongSection
                        data={recommendData.data}
                        title="Hot Songs"
                        onSeeAllPress={() => handleSeeAllPress("hot songs")}
                        onArtistPress={handleSongPress}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 32,
        zIndex: 1,
    },
    menuButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: "bold",
        marginLeft: 15,
    },
    themeButton: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 80,
    },
});