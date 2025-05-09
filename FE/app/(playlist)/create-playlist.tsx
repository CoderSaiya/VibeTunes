"use client"

import { useState, useRef } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
    Image
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useTheme } from "@/context/ThemeContext"
import * as ImagePicker from "expo-image-picker"
import { BlurView } from "expo-blur"
import TrackSearchItem from "@/components/playlist/TrackSearchItem"
import SelectedTrackItem from "@/components/playlist/SelectedTrackItem"
import {useAuth} from "@/context/AuthContext";
import {Song} from "@/types/song";
import {ImagePickerAsset} from "expo-image-picker";
import {useCreatePlaylistMutation, useGetSongListQuery} from "@/store/api";

const CreatePlaylistScreen = () => {
    const { colors, isDark } = useTheme()
    const router = useRouter()
    const {userId} = useAuth()
    const scrollViewRef = useRef(null)

    // Form state
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [coverImage, setCoverImage] = useState<ImagePickerAsset | null>(null)
    const [isSearching, setIsSearching] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Song[]>([])
    const [selectedTracks, setSelectedTracks] = useState<Song[]>([])

    const {data: songsResponse} = useGetSongListQuery({
        sortBy: "CreatedDate",
        sortDirection: "desc",
        pageSize: 100,
    })

    const [createPlaylist, {isLoading, isSuccess, error}] = useCreatePlaylistMutation();

    const songsData = songsResponse?.data || [];

    // Handle image picking
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (!result.canceled) {
            setCoverImage(result.assets[0])
        }
    }

    // Handle search
    const handleSearch = (query: string) => {
        setSearchQuery(query)
        if (query.length > 0) {
            // In a real app, you would call your API here
            setSearchResults(
                songsData.filter(
                    (track) =>
                        track.title.toLowerCase().includes(query.toLowerCase()) ||
                        track.artist.toLowerCase().includes(query.toLowerCase()),
                ),
            )
        } else {
            setSearchResults([])
        }
    }

    // Add track to selection
    const addTrack = (track: Song) => {
        if (!selectedTracks.some((t) => t.id === track.id)) {
            setSelectedTracks([...selectedTracks, track])
        }
    }

    // Remove track from selection
    const removeTrack = (trackId: string) => {
        setSelectedTracks(selectedTracks.filter((track) => track.id !== trackId))
    }

    // Handle create playlist
    const handleCreatePlaylist = () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a playlist name")
            return
        }

        setTimeout(() => {
            const formData = new FormData()

            formData.append('userId', userId as string);
            formData.append('name', name);
            formData.append('description', description);
            formData.append('isPublic', 'false');

            if (coverImage) {
                formData.append('Image', {
                    uri: coverImage.uri,
                    name: coverImage.fileName,
                    type: 'image/jpeg'
                } as any);
            }

            selectedTracks.forEach((song, index) => {
                formData.append(`songIds[${index}]`, song.id);
            });

            createPlaylist(formData);

            if (isSuccess) {
                Alert.alert("Success", "Playlist created successfully", [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ])
            }
            else if (error) {
                Alert.alert("Error", error || error || "Something went wrong. Please try again.")
            }

        }, 1500)
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Create Playlist</Text>
                    <TouchableOpacity
                        style={[styles.createButton, { opacity: name.trim() ? 1 : 0.5 }]}
                        onPress={handleCreatePlaylist}
                        disabled={!name.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.createButtonText}>Create</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Playlist Details Section */}
                    <View style={styles.detailsSection}>
                        {/* Cover Image */}
                        <TouchableOpacity style={styles.coverContainer} onPress={pickImage}>
                            {coverImage ? (
                                <Image source={{ uri: coverImage.uri }} style={styles.coverImage} />
                            ) : (
                                <View style={[styles.coverPlaceholder, { backgroundColor: colors.card }]}>
                                    <Ionicons name="musical-notes" size={40} color={colors.primary} />
                                    <Text style={[styles.coverPlaceholderText, { color: colors.secondary }]}>Add Cover</Text>
                                </View>
                            )}
                            <View style={styles.editIconContainer}>
                                <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.editIconBlur}>
                                    <Ionicons name="camera" size={16} color={colors.text} />
                                </BlurView>
                            </View>
                        </TouchableOpacity>

                        {/* Playlist Name */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.secondary }]}>Name</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
                                placeholder="My Playlist"
                                placeholderTextColor={colors.secondary}
                                value={name}
                                onChangeText={setName}
                                maxLength={50}
                            />
                        </View>

                        {/* Playlist Description */}
                        <View style={styles.inputContainer}>
                            <Text style={[styles.inputLabel, { color: colors.secondary }]}>Description (optional)</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
                                placeholder="Add an optional description"
                                placeholderTextColor={colors.secondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                maxLength={200}
                            />
                        </View>

                        {/* Privacy Setting */}
                        {/*<View style={styles.privacyContainer}>*/}
                        {/*    <View>*/}
                        {/*        <Text style={[styles.privacyTitle, { color: colors.text }]}>Public Playlist</Text>*/}
                        {/*        <Text style={[styles.privacyDescription, { color: colors.secondary }]}>*/}
                        {/*            Anyone can find and listen*/}
                        {/*        </Text>*/}
                        {/*    </View>*/}
                        {/*</View>*/}
                    </View>

                    {/* Add Songs Section */}
                    <View style={styles.songsSection}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Add Songs</Text>

                        {/* Search Bar */}
                        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                            <Ionicons name="search" size={20} color={colors.secondary} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Search for songs"
                                placeholderTextColor={colors.secondary}
                                value={searchQuery}
                                onChangeText={handleSearch}
                                onFocus={() => setIsSearching(true)}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => handleSearch("")}>
                                    <Ionicons name="close-circle" size={20} color={colors.secondary} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Search Results */}
                        {isSearching && searchResults.length > 0 && (
                            <View style={styles.searchResults}>
                                {searchResults.map((track) => (
                                    <TrackSearchItem
                                        key={track.id}
                                        track={track}
                                        onAdd={() => addTrack(track)}
                                        isAdded={selectedTracks.some((t) => t.id === track.id)}
                                    />
                                ))}
                            </View>
                        )}

                        {/* Selected Tracks */}
                        {selectedTracks.length > 0 && (
                            <View style={styles.selectedTracks}>
                                <View style={styles.selectedHeader}>
                                    <Text style={[styles.selectedTitle, { color: colors.text }]}>Selected Songs</Text>
                                    <Text style={[styles.selectedCount, { color: colors.primary }]}>{selectedTracks.length}</Text>
                                </View>

                                {selectedTracks.map((track, index) => (
                                    <SelectedTrackItem
                                        key={track.id}
                                        track={track}
                                        index={index + 1}
                                        onRemove={() => removeTrack(track.id)}
                                    />
                                ))}
                            </View>
                        )}

                        {/* Empty State */}
                        {selectedTracks.length === 0 && !isSearching && (
                            <View style={styles.emptyState}>
                                <Ionicons name="musical-notes" size={48} color={colors.secondary} />
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>No songs added yet</Text>
                                <Text style={[styles.emptyDescription, { color: colors.secondary }]}>
                                    Search for songs to add to your playlist
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: Platform.OS === "ios" ? 50 : 40,
        paddingBottom: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    createButton: {
        backgroundColor: "#1DB954", // Spotify green
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    createButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    detailsSection: {
        padding: 16,
        alignItems: "center",
    },
    coverContainer: {
        width: 160,
        height: 160,
        borderRadius: 8,
        marginBottom: 24,
        position: "relative",
        overflow: "visible",
    },
    coverImage: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
    coverPlaceholder: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    coverPlaceholderText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: "500",
    },
    editIconContainer: {
        position: "absolute",
        bottom: -10,
        right: -10,
        zIndex: 10,
    },
    editIconBlur: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    inputContainer: {
        width: "100%",
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        fontSize: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    privacyContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
    privacyTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    privacyDescription: {
        fontSize: 14,
        marginTop: 4,
    },
    songsSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        paddingVertical: 4,
    },
    searchResults: {
        marginBottom: 24,
    },
    selectedTracks: {
        marginTop: 8,
    },
    selectedHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    selectedTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    selectedCount: {
        fontSize: 16,
        fontWeight: "600",
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 32,
    },
})

export default CreatePlaylistScreen