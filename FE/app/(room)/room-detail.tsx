"use client"

import {useEffect, useRef, useState} from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Alert,
    Dimensions,
    StatusBar,
    ImageBackground,
    Animated,
    TextInput
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Stack, useRouter } from "expo-router"
import { useTheme } from "@/context/ThemeContext"
import { useRoomStore } from "@/store/roomStore"
import { usePlayerStore } from "@/store/playerStore"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuth } from "@/context/AuthContext"
import { Song } from "@/types/song"
import { LinearGradient } from "expo-linear-gradient"
import {useGetSongListQuery} from "@/store/api";

const { width, height } = Dimensions.get("window")

const RoomDetailScreen: React.FC = () => {
    const { colors } = useTheme()
    const router = useRouter()
    const { currentRoom, leaveRoom, initConnection, joinRoom, updatePlayback } = useRoomStore()
    // Use the player store
    const {
        currentSong,
        isPlaying,
        setCurrentSong,
        togglePlay,
        nextSong,
        prevSong
    } = usePlayerStore()

    const [isOwner, setIsOwner] = useState(false)
    const { userId: currentUserId } = useAuth()
    const [fadeAnim] = useState(new Animated.Value(0))
    const [showSongList, setShowSongList] = useState(false)
    const [songs, setSongs] = useState<Song[]>([])
    const [isLoadingSongs, setIsLoadingSongs] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const slideAnim = useRef(new Animated.Value(height)).current

    // Query for songs data
    const { data: songResponse, isLoading: songsIsLoading } = useGetSongListQuery({
        sortBy: "CreatedDate",
        sortDirection: "desc",
        pageSize: 100,
    })

    useEffect(() => {
        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start()

        if (!currentRoom) {
            router.replace("/(tabs)/room")
            return
        }

        const checkOwner = async () => {
            try {
                setIsOwner(currentRoom?.hostId === currentUserId)
            } catch (err) {
                console.error("Failed to load userId", err)
            }
        }

        // Connect to SignalR hub for this room
        const connectToHub = async () => {
            try {
                const token = await AsyncStorage.getItem("accessToken") as string
                await initConnection()
                await joinRoom(currentRoom?.id as string)
            } catch (error) {
                console.error("Error connecting to hub:", error)
                Alert.alert("Connection Error", "Failed to connect to the room. Please try again.")
            }
        }

        console.log("currentRoom", currentRoom)

        checkOwner()
        connectToHub()

        // Cleanup when leaving the screen
        return () => {
            if (currentRoom) {
                leaveRoom().catch(console.error)
                setCurrentSong(null)
            }
        }
    }, [currentRoom, router])

    useEffect(() => {
        // Update songs when songResponse changes
        if (songResponse?.data) {
            setSongs(songResponse.data);
        }
    }, [songResponse]);

    useEffect(() => {
        if (showSongList) {
            setIsLoadingSongs(songsIsLoading);

            // Slide up animation
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 70,
                friction: 12
            }).start()
        } else {
            // Slide down animation
            Animated.spring(slideAnim, {
                toValue: height,
                useNativeDriver: true,
                tension: 70,
                friction: 12
            }).start()
        }
    }, [showSongList, songsIsLoading])

    const handleLeaveRoom = async () => {
        try {
            await leaveRoom()
            router.replace("/(tabs)/room")
        } catch (error) {
            console.error("Error leaving room:", error)
            Alert.alert("Error", "Failed to leave room. Please try again.")
        }
    }

    const handlePlayPause = async () => {
        if (!currentRoom) return

        try {
            // Toggle play/pause using the player store
            togglePlay()

            // Notify other users through SignalR
            if (isPlaying) {
                await updatePlayback("Stopped", currentSong?.id as string, 0)
            } else {
                await updatePlayback("Playing", currentSong?.id as string, 0)
            }
        } catch (error) {
            console.error("Error controlling playback:", error)
        }
    }

    const handleSkip = async () => {
        if (!currentRoom) return

        try {
            // Skip to next song using the player store
            nextSong()

            // Notify other users through SignalR

        } catch (error) {
            console.error("Error skipping song:", error)
            Alert.alert("Error", "Failed to skip song. Please try again.")
        }
    }

    const handlePrevious = async () => {
        if (!currentRoom) return

        try {
            // Go to previous song using the player store
            prevSong()
            updatePlayback("Playing", currentSong?.id as string, 0)

            // Notify other users through SignalR if you have a method for this
            // await signalRService.previousSong(currentRoom.id)
        } catch (error) {
            console.error("Error going to previous song:", error)
            Alert.alert("Error", "Failed to go to previous song. Please try again.")
        }
    }

    const handleSelectSong = async (song: Song) => {
        if (!currentRoom) return

        try {
            // Set as current song using the player store
            setCurrentSong(song)

            // Notify other users through SignalR
            await updatePlayback("Playing", song.id, 0)

            // Hide song list
            setShowSongList(false)
        } catch (error) {
            console.error("Error selecting song:", error)
            Alert.alert("Error", "Failed to set song. Please try again.")
        }
    }

    const toggleSongList = () => {
        setShowSongList(!showSongList)
        if (!showSongList) {
            setSearchQuery("")
        }
    }

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const renderListenerItem = ({ item, index }: { item: any; index: number }) => (
        <Animated.View
            style={[
                styles.listenerItem,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                        })}]
                }
            ]}
        >
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
                    style={styles.listenerAvatar}
                />
                {item.id === currentRoom?.hostId && (
                    <View style={[styles.ownerBadge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="star" size={10} color="#FFFFFF" />
                    </View>
                )}
            </View>
            <Text style={[styles.listenerName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        </Animated.View>
    )

    const renderSongItem = ({ item }: { item: Song }) => (
        <TouchableOpacity
            style={[styles.songItem, { backgroundColor: colors.card }]}
            onPress={() => handleSelectSong(item)}
        >
            <Image
                source={{ uri: item.coverImgUrl || "https://via.placeholder.com/60"}}
                style={styles.songCover}
            />
            <View style={styles.songInfo}>
                <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.songArtist, { color: colors.text + '80' }]} numberOfLines={1}>{item.artist}</Text>
            </View>
            <Ionicons name="play-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
    )

    if (!currentRoom) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.loadingContainer}>
                    <Ionicons name="musical-notes" size={50} color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.text, marginTop: 20 }]}>Loading room...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background with gradient overlay */}
            {currentSong?.coverImgUrl && (
                <ImageBackground
                    source={{ uri: currentSong.coverImgUrl }}
                    style={styles.backgroundImage}
                    blurRadius={20}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.7)', colors.background]}
                        style={styles.gradientOverlay}
                    />
                </ImageBackground>
            )}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleLeaveRoom}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{currentRoom.name}</Text>
                    <View style={styles.roomInfoBadge}>
                        <Ionicons name="people" size={14} color={colors.text} />
                        <Text style={[styles.roomInfoText, { color: colors.text }]}>
                            {currentRoom.participants.length}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Now Playing Section */}
                <Animated.View
                    style={[
                        styles.nowPlayingContainer,
                        {
                            backgroundColor: colors.card,
                            opacity: fadeAnim,
                            transform: [{ scale: fadeAnim }]
                        }
                    ]}
                >
                    {currentSong ? (
                        <>
                            <View style={styles.albumArtContainer}>
                                <Image
                                    source={{ uri: currentSong.coverImgUrl || "https://via.placeholder.com/200" }}
                                    style={styles.nowPlayingImage}
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                                    style={styles.imageGradient}
                                />
                            </View>

                            <View style={styles.nowPlayingInfo}>
                                <Text style={[styles.nowPlayingTitle, { color: colors.text }]} numberOfLines={1}>
                                    {currentSong.title}
                                </Text>
                                <Text style={[styles.nowPlayingArtist, { color: colors.text }]} numberOfLines={1}>
                                    {currentSong.artist}
                                </Text>
                            </View>

                            {isOwner && (
                                <View style={styles.playbackControls}>
                                    <TouchableOpacity
                                        style={[styles.controlButton, { backgroundColor: colors.primary + '20' }]}
                                        onPress={handlePrevious}
                                    >
                                        <Ionicons name="play-skip-back" size={28} color={colors.primary} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.controlButton, { backgroundColor: colors.primary + '20' }]}
                                        onPress={handlePlayPause}
                                    >
                                        <Ionicons
                                            name={isPlaying ? "pause" : "play"}
                                            size={28}
                                            color={colors.primary}
                                        />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.controlButton, { backgroundColor: colors.primary + '20' }]}
                                        onPress={handleSkip}
                                    >
                                        <Ionicons name="play-skip-forward" size={28} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </>
                    ) : (
                        <View style={styles.noSongContainer}>
                            <Ionicons name="musical-notes" size={64} color={colors.primary} />
                            <Text style={[styles.noSongText, { color: colors.text }]}>No song playing</Text>
                            <Text style={[styles.noSongSubtext, { color: colors.text + '80' }]}>
                                {isOwner ? "Select a song from the library below" : "Waiting for host to set a song"}
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* Choose Song Button (Only for room owner) */}
                {isOwner && (
                    <Animated.View
                        style={[
                            styles.chooseSongContainer,
                            {
                                backgroundColor: colors.card,
                                opacity: fadeAnim,
                                transform: [{ translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0]
                                    })}]
                            }
                        ]}
                    >
                        <TouchableOpacity
                            style={[styles.chooseSongButton, { backgroundColor: colors.primary }]}
                            onPress={toggleSongList}
                        >
                            <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
                            <Text style={styles.chooseSongButtonText}>
                                {showSongList ? "Close Song List" : "Choose a Song"}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Listeners Section */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Listeners ({currentRoom.participants.length})
                    </Text>
                </View>

                <FlatList
                    data={currentRoom.participants}
                    renderItem={renderListenerItem}
                    keyExtractor={item => item}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.listenersList}
                    contentContainerStyle={styles.listenersContainer}
                />
            </View>

            {/* Song List Modal */}
            <Animated.View
                style={[
                    styles.songListContainer,
                    {
                        backgroundColor: colors.background,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <View style={styles.songListHeader}>
                    <Text style={[styles.songListTitle, { color: colors.text }]}>Select a Song</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowSongList(false)}
                    >
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                    <Ionicons name="search" size={20} color={colors.text + '80'} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search songs..."
                        placeholderTextColor={colors.text + '60'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={20} color={colors.text + '80'} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {isLoadingSongs ? (
                    <View style={styles.loadingContainer}>
                        <Text style={[styles.loadingText, { color: colors.text }]}>Loading songs...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredSongs}
                        renderItem={renderSongItem}
                        keyExtractor={item => item.id}
                        style={styles.songList}
                        contentContainerStyle={styles.songListContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyListContainer}>
                                <Ionicons name="musical-note-outline" size={40} color={colors.text + '40'} />
                                <Text style={[styles.emptyListText, { color: colors.text + '80' }]}>
                                    {searchQuery ? "No songs match your search" : "No songs available"}
                                </Text>
                            </View>
                        }
                    />
                )}
            </Animated.View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '50%',
        top: 0,
    },
    gradientOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginRight: 8,
    },
    roomInfoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roomInfoText: {
        fontSize: 12,
        marginLeft: 4,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 18,
    },
    nowPlayingContainer: {
        borderRadius: 16,
        padding: 0,
        marginBottom: 24,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    albumArtContainer: {
        position: 'relative',
        width: '100%',
    },
    nowPlayingImage: {
        width: '100%',
        height: 220,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    nowPlayingInfo: {
        padding: 16,
    },
    nowPlayingTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
    },
    nowPlayingArtist: {
        fontSize: 16,
        opacity: 0.8,
    },
    playbackControls: {
        flexDirection: "row",
        justifyContent: "center",
        paddingBottom: 16,
        gap: 16,
    },
    controlButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noSongContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    noSongText: {
        fontSize: 18,
        marginTop: 15,
        fontWeight: "600",
    },
    noSongSubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    chooseSongContainer: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    chooseSongButton: {
        height: 48,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    chooseSongButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    listenersList: {
        marginBottom: 24,
    },
    listenersContainer: {
        paddingVertical: 8,
    },
    listenerItem: {
        alignItems: "center",
        marginRight: 16,
        width: 70,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    listenerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    listenerName: {
        fontSize: 12,
        textAlign: "center",
        width: '100%',
    },
    ownerBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    // Song List Modal Styles
    songListContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: height * 0.7,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    songListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    songListTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 46,
        borderRadius: 8,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 8,
        fontSize: 16,
    },
    songList: {
        flex: 1,
    },
    songListContent: {
        paddingBottom: 20,
    },
    songItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 8,
        borderRadius: 12,
    },
    songCover: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    songInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    songArtist: {
        fontSize: 14,
    },
    emptyListContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyListText: {
        fontSize: 16,
        marginTop: 12,
    },
})

export default RoomDetailScreen;