"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Modal,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { AntDesign, Feather, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter, Stack } from "expo-router"

import { AvatarUpload } from "@/components/profile/AvatarUpload"
import { useGetProfileQuery, useUpdateProfileMutation } from "@/store/api"
import type { UpdateProfileRequest } from "@/types/profile"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { ImagePickerAsset } from "expo-image-picker";

export default function EditProfileScreen() {
    const { isAuthenticated, userId } = useAuth()
    const router = useRouter()
    if (!isAuthenticated) router.replace("/")

    const { colors } = useTheme()

    const { data: profileResponse, isLoading: isLoadingProfile } = useGetProfileQuery(userId as string)
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

    const profile = profileResponse?.data

    // Form state based on the new Profile interface
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [stageName, setStageName] = useState("")
    const [bio, setBio] = useState("")
    const [street, setStreet] = useState("")
    const [district, setDistrict] = useState("")
    const [city, setCity] = useState("")
    const [country, setCountry] = useState("")
    const [selectedGender, setSelectedGender] = useState<string | undefined>(undefined)
    const [avatar, setAvatar] = useState<ImagePickerAsset | null>(null)
    const [showGenderModal, setShowGenderModal] = useState(false)

    // Gender options
    const genderOptions = [
        { id: 1, value: "Male", icon: <FontAwesome name="male" size={22} color="#3498db" /> },
        { id: 2, value: "Female", icon: <FontAwesome name="female" size={22} color="#e84393" /> },
        { id: 3, value: "Other", icon: <MaterialIcons name="person" size={22} color="#6c5ce7" /> },
    ]

    // Load profile data
    useEffect(() => {
        if (profile) {
            setFirstName(profile.name?.firstName || "")
            setLastName(profile.name?.lastName || "")
            setStageName(profile.stageName || "")
            setBio(profile.bio || "")
            setStreet(profile.address?.street || "")
            setDistrict(profile.address?.district || "")
            setCity(profile.address?.city || "")
            setCountry(profile.address?.country || "")
            setSelectedGender(profile.gender || "")
        }
    }, [profile])

    const handleAvatarUpdated = (imageAsset: ImagePickerAsset) => {
        setAvatar(imageAsset)
    }

    const handleSaveProfile = async () => {
        try {
            const updateData: UpdateProfileRequest = {
                id: userId as string,
                firstName,
                lastName,
                address: `${street}, ${district}, ${city}, ${country}`,
                gender: selectedGender,
            }

            // Only add avatar to the request if it has a valid URI
            if (avatar && avatar.uri && avatar.uri.trim() !== '') {
                updateData.avatar = avatar
            }

            await updateProfile(updateData).unwrap()
            Alert.alert("Success", "Your profile has been updated successfully")
            router.back()
        } catch (error) {
            console.error("Error updating profile:", error)
            Alert.alert("Error", "Failed to update profile. Please try again.")
        }
    }

    const renderGenderIcon = () => {
        switch (selectedGender) {
            case "Male":
                return <FontAwesome name="male" size={22} color="#3498db" />
            case "Female":
                return <FontAwesome name="female" size={22} color="#e84393" />
            case "Other":
                return <MaterialIcons name="person" size={22} color="#6c5ce7" />
            default:
                return <Feather name="user" size={22} color="#666" />
        }
    }

    if (isLoadingProfile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7c4dff" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <StatusBar style="light" />

            <Stack.Screen
                options={{
                    title: "Edit Profile",
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerTintColor: "#fff",
                    headerShadowVisible: false,
                }}
            />

            <LinearGradient colors={[colors.primary, "#FF4347", "#FF7F50"]} style={styles.headerGradient} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <BlurView intensity={80} tint="light" style={styles.profileCard}>
                    <AvatarUpload
                        currentAvatarUrl={profile?.avatar || ""}
                        onAvatarUpdated={handleAvatarUpdated}
                        isUploading={isUpdating}
                    />

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Basic Information</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>First Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Your first name"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Last Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Your last name"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Stage Name (optional)</Text>
                            <TextInput
                                style={styles.textInput}
                                value={stageName}
                                onChangeText={setStageName}
                                placeholder="Your stage name"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bio (optional)</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Gender</Text>
                            <TouchableOpacity style={styles.selectInput} onPress={() => setShowGenderModal(true)}>
                                <View style={styles.selectInputContent}>
                                    {renderGenderIcon()}
                                    <Text style={styles.selectInputText}>{selectedGender || "Select gender"}</Text>
                                </View>
                                <Feather name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Address</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Street</Text>
                            <TextInput
                                style={styles.textInput}
                                value={street}
                                onChangeText={setStreet}
                                placeholder="Street address"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>District</Text>
                            <TextInput
                                style={styles.textInput}
                                value={district}
                                onChangeText={setDistrict}
                                placeholder="District"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>City</Text>
                            <TextInput
                                style={styles.textInput}
                                value={city}
                                onChangeText={setCity}
                                placeholder="City"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Country</Text>
                            <TextInput
                                style={styles.textInput}
                                value={country}
                                onChangeText={setCountry}
                                placeholder="Country"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                { backgroundColor: colors.primary }
                            ]}
                            onPress={handleSaveProfile} disabled={isUpdating}>
                            {isUpdating ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Feather name="check" size={18} color="#fff" style={styles.saveButtonIcon} />
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </ScrollView>

            {/* Gender Selection Modal */}
            <Modal
                visible={showGenderModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowGenderModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Select Gender</Text>
                            <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                                <AntDesign name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <TouchableOpacity
                                style={[
                                    styles.genderItem,
                                    {
                                        backgroundColor: !selectedGender ? colors.primary + "20" : "transparent",
                                        borderColor: colors.border,
                                    },
                                ]}
                                onPress={() => {
                                    setSelectedGender(undefined)
                                    setShowGenderModal(false)
                                }}
                            >
                                <Text style={[styles.genderItemText, { color: colors.text }]}>Not specified</Text>
                                {!selectedGender && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
                            </TouchableOpacity>

                            {genderOptions.map((gender) => (
                                <TouchableOpacity
                                    key={gender.id}
                                    style={[
                                        styles.genderItem,
                                        {
                                            backgroundColor: selectedGender === gender.value ? colors.primary + "20" : "transparent",
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    onPress={() => {
                                        setSelectedGender(gender.value)
                                        setShowGenderModal(false)
                                    }}
                                >
                                    <View style={styles.genderItemContent}>
                                        <View style={[styles.genderIconContainer, { backgroundColor: colors.border }]}>{gender.icon}</View>
                                        <Text style={[styles.genderItemText, { color: colors.text }]}>{gender.value}</Text>
                                    </View>

                                    {selectedGender === gender.value && (
                                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
    },
    headerGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f8f8",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#666",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
    },
    profileCard: {
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 16,
    },
    formSection: {
        padding: 16,
        marginTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#333",
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: "#333",
    },
    textArea: {
        minHeight: 100,
        paddingTop: 12,
    },
    selectInput: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectInputContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    selectInputText: {
        fontSize: 16,
        color: "#333",
        marginLeft: 10,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        backgroundColor: "#fff",
        marginRight: 8,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    saveButton: {
        flex: 2,
        flexDirection: "row",
        paddingVertical: 14,
        borderRadius: 12,
        marginLeft: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonIcon: {
        marginRight: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end", // This ensures the modal appears at the bottom
    },
    modalContainer: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 16,
        maxHeight: "60%", // Reduced height to make it more compact
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
    modalHeaderTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    modalBody: {
        padding: 16,
        maxHeight: 300, // Limit the height to ensure it doesn't take up too much space
    },
    genderItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 8,
    },
    genderItemContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    genderIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    genderItemText: {
        fontSize: 16,
        flex: 1,
    },
});