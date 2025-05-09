"use client"

import { useState, useRef, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Platform,
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    FlatList,
} from "react-native"
import { useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import * as DocumentPicker from "expo-document-picker"
import { Ionicons, FontAwesome5, AntDesign } from "@expo/vector-icons"
import RNDateTimePicker from "@react-native-community/datetimepicker"
import { format } from "date-fns"

import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import {useCreateSongMutation, useGetAlbumByArtistQuery, useGetGenresQuery} from "@/store/api"
import {Genre} from "@/types/upload"
import {ImagePickerAsset} from "expo-image-picker"
import {DocumentPickerAsset} from "expo-document-picker"

export default function UploadTrackScreen() {
    const { colors } = useTheme()
    const { isAuthenticated, userId } = useAuth()
    const router = useRouter()

    if (!isAuthenticated) router.push("/login")

    // RTK Query hooks
    const [createSong, { isLoading }] = useCreateSongMutation()
    const { data: genres } = useGetGenresQuery()
    const { data: albums } = useGetAlbumByArtistQuery(userId as string)

    // Form state
    const [title, setTitle] = useState("")
    const [albumId, setAlbumId] = useState<string | undefined>()
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [releaseDate, setReleaseDate] = useState(new Date())
    const [image, setImage] = useState<ImagePickerAsset | null>(null)
    const [audio, setAudio] = useState<DocumentPickerAsset | null>(null)

    // UI state
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
    const [audioFileName, setAudioFileName] = useState<string | null>(null)
    const [showAlbumModal, setShowAlbumModal] = useState(false)
    const [showGenreModal, setShowGenreModal] = useState(false)
    const [searchGenre, setSearchGenre] = useState("")

    // Computed properties
    const genreDisplayText = selectedGenres.length > 0
        ? selectedGenres.join(', ')
        : ""

    // Handle cover image selection
    const handleSelectCoverImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "You need to grant access to your photo library to select a cover image.")
                return
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0]
                setCoverImagePreview(asset.uri)

                setImage(result.assets[0])
                setErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.image
                    return newErrors
                })
            }
        } catch (error) {
            console.error("Error selecting cover image:", error)
            Alert.alert("Error", "Failed to select cover image. Please try again.")
        }
    }

    // Handle audio file selection
    const handleSelectAudioFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "audio/*",
                copyToCacheDirectory: true,
            })

            if (result.canceled === false && result.assets && result.assets.length > 0) {
                const asset = result.assets[0]

                // Check file size (limit to 50MB for example)
                if (asset.size && asset.size > 50 * 1024 * 1024) {
                    Alert.alert("File Too Large", "Audio file must be less than 50MB.")
                    return
                }

                setAudioFileName(asset.name)

                setAudio(result.assets[0])
                setErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.audio
                    return newErrors
                })
            }
        } catch (error) {
            console.error("Error selecting audio file:", error)
            Alert.alert("Error", "Failed to select audio file. Please try again.")
        }
    }

    // Handle date change
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === "ios")

        if (selectedDate) {
            setReleaseDate(selectedDate)
        }
    }

    // Toggle genre selection
    const toggleGenreSelection = (genreName: string) => {
        setSelectedGenres(prevGenres => {
            if (prevGenres.includes(genreName)) {
                return prevGenres.filter(g => g !== genreName)
            } else {
                return [...prevGenres, genreName]
            }
        })

        setErrors((prev) => {
            const newErrors = { ...prev }
            delete newErrors.genre
            return newErrors
        })
    }

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!title.trim()) {
            newErrors.title = "Title is required"
        }

        if (selectedGenres.length === 0) {
            newErrors.genre = "At least one genre is required"
        }

        if (!image) {
            newErrors.image = "Cover image is required"
        }

        if (!audio) {
            newErrors.audio = "Audio file is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm() || !userId || !image || !audio) {
            Alert.alert("Form Incomplete", "Please fill in all required fields.")
            return
        }

        try {
            const response = await createSong({
                artistId: userId as string,
                albumId,
                title,
                image,
                audio,
                releaseDate,
                genre: selectedGenres.join(", "), // Join selected genres with comma
            }).unwrap()

            if (response.data && response.isSuccess === true) {
                Alert.alert("Upload Successful", "Your track has been uploaded successfully!", [
                    {
                        text: "View My Tracks",
                        onPress: () => router.push("/artist/tracks"),
                    },
                    {
                        text: "Upload Another",
                        onPress: () => {
                            // Reset form
                            setTitle("")
                            setAlbumId(undefined)
                            setSelectedGenres([])
                            setReleaseDate(new Date())
                            setImage(null)
                            setAudio(null)
                            setCoverImagePreview(null)
                            setAudioFileName(null)
                        },
                    },
                ])
            } else {
                Alert.alert("Upload Failed", String(response.message) || "There was an error uploading your track.")
            }
        } catch (error: any) {
            console.error("Error uploading track:", error)
            Alert.alert("Upload Failed", error.data?.message || "There was an error uploading your track. Please try again.")
        }
    }

    // Filtered genres for search
    const filteredGenres = genres?.data?.filter((genre: Genre) =>
        genre.name.toLowerCase().includes(searchGenre.toLowerCase())
    ) || []

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Upload Track</Text>
            </View>

            <View style={styles.formContainer}>
                {/* Title */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Track Title *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.card,
                                color: colors.text,
                                borderColor: errors.title ? "#FF3B30" : colors.border,
                            },
                        ]}
                        placeholder="Enter track title"
                        placeholderTextColor={colors.text + "80"}
                        value={title}
                        onChangeText={(text) => {
                            setTitle(text)
                            if (text.trim()) {
                                setErrors((prev) => {
                                    const newErrors = { ...prev }
                                    delete newErrors.title
                                    return newErrors
                                })
                            }
                        }}
                    />
                    {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                </View>

                {/* Album (Optional) */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Album (Optional)</Text>
                    <TouchableOpacity
                        style={[
                            styles.selectContainer,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            },
                        ]}
                        onPress={() => setShowAlbumModal(true)}
                    >
                        <Ionicons name="albums-outline" size={20} color={colors.text} style={styles.selectIcon} />
                        <Text
                            style={[
                                styles.selectText,
                                {
                                    color: albums?.data?.find((a) => a.id === albumId)?.title ? colors.text : colors.text + "80"
                                }
                            ]}
                        >
                            {albums?.data?.find((a) => a.id === albumId)?.title || "Select album or leave empty for single"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={colors.text} style={styles.selectChevron} />
                    </TouchableOpacity>
                </View>

                {/* Genre */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Genre(s) *</Text>
                    <TouchableOpacity
                        style={[
                            styles.selectContainer,
                            {
                                backgroundColor: colors.card,
                                borderColor: errors.genre ? "#FF3B30" : colors.border,
                            },
                        ]}
                        onPress={() => setShowGenreModal(true)}
                    >
                        <Ionicons name="musical-notes-outline" size={20} color={colors.text} style={styles.selectIcon} />
                        <Text
                            style={[
                                styles.selectText,
                                {
                                    color: selectedGenres.length > 0 ? colors.text : colors.text + "80"
                                }
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {genreDisplayText || "Select genre(s)"}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={colors.text} style={styles.selectChevron} />
                    </TouchableOpacity>
                    {errors.genre && <Text style={styles.errorText}>{errors.genre}</Text>}
                </View>

                {/* Release Date */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Release Date *</Text>
                    <TouchableOpacity
                        style={[
                            styles.datePickerButton,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                            },
                        ]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color={colors.text} style={styles.datePickerIcon} />
                        <Text style={[styles.datePickerText, { color: colors.text }]}>{format(releaseDate, "MMMM d, yyyy")}</Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <RNDateTimePicker
                            value={releaseDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}
                </View>

                {/* Cover Image */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Cover Image *</Text>
                    <TouchableOpacity
                        style={[
                            styles.coverImageContainer,
                            {
                                backgroundColor: colors.card,
                                borderColor: errors.image ? "#FF3B30" : colors.border,
                            },
                        ]}
                        onPress={handleSelectCoverImage}
                    >
                        {coverImagePreview ? (
                            <Image source={{ uri: coverImagePreview }} style={styles.coverImagePreview} />
                        ) : (
                            <View style={styles.coverImagePlaceholder}>
                                <Ionicons name="image-outline" size={40} color={colors.text + "80"} />
                                <Text style={[styles.coverImageText, { color: colors.text + "80" }]}>Tap to select cover image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
                </View>

                {/* Audio File */}
                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Audio File *</Text>
                    <TouchableOpacity
                        style={[
                            styles.audioFileContainer,
                            {
                                backgroundColor: colors.card,
                                borderColor: errors.audio ? "#FF3B30" : colors.border,
                            },
                        ]}
                        onPress={handleSelectAudioFile}
                    >
                        {audioFileName ? (
                            <View style={styles.audioFileInfo}>
                                <FontAwesome5 name="file-audio" size={24} color={colors.primary} />
                                <View style={styles.audioFileDetails}>
                                    <Text style={[styles.audioFileName, { color: colors.text }]}>{audioFileName}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.audioFilePlaceholder}>
                                <FontAwesome5 name="file-audio" size={40} color={colors.text + "80"} />
                                <Text style={[styles.audioFileText, { color: colors.text + "80" }]}>Tap to select audio file</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    {errors.audio && <Text style={styles.errorText}>{errors.audio}</Text>}
                </View>

                {/* Submit button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        {
                            backgroundColor: colors.primary,
                            opacity: isLoading ? 0.7 : 1,
                        },
                    ]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.submitButtonText}>Upload Track</Text>
                            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Album Selection Modal */}
            <Modal
                visible={showAlbumModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowAlbumModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContainer,
                            { backgroundColor: colors.background }
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Album</Text>
                            <TouchableOpacity onPress={() => setShowAlbumModal(false)}>
                                <AntDesign name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <TouchableOpacity
                                style={[
                                    styles.albumItem,
                                    {
                                        backgroundColor: !albumId ? colors.primary + "20" : "transparent",
                                        borderColor: colors.border
                                    }
                                ]}
                                onPress={() => {
                                    setAlbumId(undefined)
                                    setShowAlbumModal(false)
                                }}
                            >
                                <Text style={[styles.albumItemText, { color: colors.text }]}>No Album (Single)</Text>
                                {!albumId && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                )}
                            </TouchableOpacity>

                            {albums?.data?.map((album) => (
                                <TouchableOpacity
                                    key={album.id}
                                    style={[
                                        styles.albumItem,
                                        {
                                            backgroundColor: albumId === album.id ? colors.primary + "20" : "transparent",
                                            borderColor: colors.border
                                        }
                                    ]}
                                    onPress={() => {
                                        setAlbumId(album.id)
                                        setShowAlbumModal(false)
                                    }}
                                >
                                    <View style={styles.albumItemContent}>
                                        {album.coverImgUrl ? (
                                            <Image
                                                source={{ uri: album.coverImgUrl }}
                                                style={styles.albumCover}
                                            />
                                        ) : (
                                            <View style={[styles.albumCoverPlaceholder, { backgroundColor: colors.border }]}>
                                                <Ionicons name="musical-notes" size={20} color={colors.text} />
                                            </View>
                                        )}
                                        <Text style={[styles.albumItemText, { color: colors. text }]}>{album.title}</Text>
                                    </View>

                                    {albumId === album.id && (
                                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Genre Selection Modal */}
            <Modal
                visible={showGenreModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowGenreModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalContainer,
                            { backgroundColor: colors.background }
                        ]}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Genre(s)</Text>
                            <TouchableOpacity onPress={() => setShowGenreModal(false)}>
                                <AntDesign name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="search" size={20} color={colors.text + "80"} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Search genres..."
                                placeholderTextColor={colors.text + "80"}
                                value={searchGenre}
                                onChangeText={setSearchGenre}
                            />
                            {searchGenre.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchGenre("")}>
                                    <AntDesign name="close" size={16} color={colors.text + "80"} />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.selectedGenresContainer}>
                            {selectedGenres.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedGenresScroll}>
                                    {selectedGenres.map((genreName) => (
                                        <View
                                            key={genreName}
                                            style={[styles.genreChip, { backgroundColor: colors.primary }]}
                                        >
                                            <Text style={styles.genreChipText}>{genreName}</Text>
                                            <TouchableOpacity
                                                style={styles.genreChipRemove}
                                                onPress={() => toggleGenreSelection(genreName)}
                                            >
                                                <AntDesign name="close" size={12} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </View>

                        <FlatList
                            data={filteredGenres}
                            keyExtractor={(item: Genre) => item.id}
                            style={styles.genreList}
                            contentContainerStyle={{ paddingBottom: 80 }} // Thêm padding phía dưới để tránh che khuất phần tử cuối
                            showsVerticalScrollIndicator={true}
                            renderItem={({ item }: { item: Genre }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.genreItem,
                                        {
                                            backgroundColor: selectedGenres.includes(item.name) ? colors.primary + "20" : "transparent",
                                            borderColor: colors.border
                                        }
                                    ]}
                                    onPress={() => toggleGenreSelection(item.name)}
                                >
                                    <Text style={[styles.genreItemText, { color: colors.text }]}>{item.name}</Text>

                                    {selectedGenres.includes(item.name) ? (
                                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                    ) : (
                                        <Ionicons name="add-circle-outline" size={24} color={colors.text} />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyList}>
                                    <Text style={[styles.emptyListText, { color: colors.text }]}>
                                        No genres found
                                    </Text>
                                </View>
                            )}
                        />

                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: colors.primary }]}
                            onPress={() => setShowGenreModal(false)}
                        >
                            <Text style={styles.modalButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginLeft: 8,
    },
    formContainer: {
        width: "100%",
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderRadius: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        fontSize: 16,
    },
    selectContainer: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    selectIcon: {
        marginRight: 12,
    },
    selectText: {
        flex: 1,
        fontSize: 16,
    },
    selectChevron: {
        marginLeft: 8,
    },
    datePickerButton: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    datePickerIcon: {
        marginLeft: 16,
        marginRight: 8,
    },
    datePickerText: {
        fontSize: 16,
    },
    coverImageContainer: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 8,
        borderWidth: 1,
        overflow: "hidden",
    },
    coverImagePreview: {
        width: "100%",
        height: "100%",
    },
    coverImagePlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    coverImageText: {
        fontSize: 16,
        marginTop: 12,
    },
    audioFileContainer: {
        width: "100%",
        borderRadius: 8,
        borderWidth: 1,
        padding: 16,
        minHeight: 100,
    },
    audioFilePlaceholder: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 16,
    },
    audioFileText: {
        fontSize: 16,
        marginTop: 12,
    },
    audioFileInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    audioFileDetails: {
        marginLeft: 12,
        flex: 1,
    },
    audioFileName: {
        fontSize: 16,
        fontWeight: "500",
    },
    errorText: {
        color: "#FF3B30",
        fontSize: 14,
        marginTop: 4,
    },
    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        borderRadius: 24,
        paddingHorizontal: 24,
        marginTop: 16,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginRight: 8,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 16,
        maxHeight: "90%", // Tăng độ cao tối đa
        height: 600, // Thiết lập chiều cao cố định để modal dài hơn
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    modalBody: {
        padding: 16,
        maxHeight: 400,
    },
    albumItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
    },
    albumItemContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    albumCover: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
    },
    albumCoverPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    albumItemText: {
        fontSize: 16,
        flex: 1,
    },
    genreItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
    },
    genreItemText: {
        fontSize: 16,
        flex: 1,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 12,
        margin: 16,
    },
    searchInput: {
        flex: 1,
        height: "100%",
        marginLeft: 8,
        fontSize: 16,
    },
    modalButton: {
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        margin: 16,
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    selectedGenresContainer: {
        marginHorizontal: 16,
        minHeight: 40,
    },
    selectedGenresScroll: {
        flexDirection: "row",
        marginVertical: 8,
    },
    genreChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007AFF",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginRight: 8,
    },
    genreChipText: {
        color: "#fff",
        fontSize: 14,
    },
    genreChipRemove: {
        marginLeft: 6,
    },
    genreList: {
        flex: 1,
        padding: 16,
    },
    emptyList: {
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyListText: {
        fontSize: 16,
    },
})