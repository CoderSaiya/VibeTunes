"use client";
import React, {useRef, useState, useEffect, useCallback} from "react";
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Platform,
    ListRenderItemInfo, ImageSourcePropType, RefreshControl, TextInput,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { usePlayerStore } from "@/store/playerStore";
import { Profile } from "@/types/user";
import { useRouter } from "expo-router";
import {useChangePasswordMutation, useGetProfileQuery } from "@/store/api";
import { useAuth } from "@/context/AuthContext";
// @ts-ignore
import defaultAvatar from "@/public/imgs/logo.png"
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";

const { width } = Dimensions.get("window");
const headerHeight = 340;
const headerFinalHeight = 80;
const imageSize = 120;
const imageFinalSize = 40;

// Define types for the profile items
type ProfileHeader = {
    id: "header";
};

type ProfileStats = {
    id: "stats";
    type: "stats";
    data: { label: string; value: string }[];
};

type ProfileSection = {
    id: string; // e.g. "about", "favorites"
    type: "section";
    title: string;
    content: string | null;
};

type ProfileActivityItem = {
    id: string;
    type: "room" | "playlist" | "follow";
    title: string;
    subtitle: string;
    time: string;
    icon: string;
};

type ProfileTracks = {
    id: "recentActivity";
    type: "tracks";
    title: string;
    tracks: {
        id: string;
        title: string;
        artist: string;
        image: string;
    }[];
};

type ProfileSettingsItem = {
    id: string;
    title: string;
    icon: string;
};

type ProfileSettings = {
    id: "settings";
    type: "settings";
    items: ProfileSettingsItem[];
};

type ProfileDataItem =
    | ProfileHeader
    | ProfileStats
    | ProfileTracks
    | ProfileSection
    | ProfileSettings;

// Mock data for sections other than the header
const PROFILE_SECTIONS: Exclude<ProfileDataItem, ProfileHeader>[] = [
    {
        id: "stats",
        type: "stats",
        data: [
            { label: "Playlists", value: "0" },
            { label: "Followers", value: "0" },
            { label: "Following", value: "0" },
        ],
    },
    {
        id: "favorites",
        type: "section",
        title: "Favorite Genres•",
        content: null,
    },
    // {
    //     id: "recentActivity",
    //     type: "activity",
    //     title: "Recent Activity",
    //     items: [
    //         {
    //             id: "1",
    //             type: "room",
    //             title: "Chill Vibes Room",
    //             subtitle: "Created a new music room",
    //             time: "2 hours ago",
    //             icon: "musical-notes",
    //         },
    //         {
    //             id: "2",
    //             type: "playlist",
    //             title: "Summer Hits 2023",
    //             subtitle: "Added 5 new tracks",
    //             time: "Yesterday",
    //             icon: "list",
    //         },
    //         {
    //             id: "3",
    //             type: "follow",
    //             title: "Jane Smith",
    //             subtitle: "Started following you",
    //             time: "2 days ago",
    //             icon: "person-add",
    //         },
    //     ],
    // },
    {
        id: "recentActivity",
        type: "tracks",
        title: "Recently Tracks",
        tracks: [],
    },
    {
        id: "settings",
        type: "settings",
        items: [
            { id: "1", title: "Edit Profile", icon: "create-outline" },
            { id: "2", title: "Change Password", icon: "key-outline" },
            { id: "3", title: "Notifications", icon: "notifications-outline" },
            { id: "4", title: "Privacy", icon: "lock-closed-outline" },
            { id: "5", title: "Help & Support", icon: "help-circle-outline" },
            { id: "6", title: "Logout", icon: "log-out-outline" },
        ],
    },
];

const ProfileScreen: React.FC = () => {
    const { colors, isDark, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;
    const [nameWidth, setNameWidth] = useState<number>(0);
    const [usernameWidth, setUsernameWidth] = useState<number>(0);
    const router = useRouter();
    const { isAuthenticated, userId, role, logout } = useAuth();
    const playerStore = usePlayerStore();
    const [refreshing, setRefreshing] = useState(false)

    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const newPasswordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }
    }, [isAuthenticated, router]);

    const isArtist = role?.toLowerCase() === "artist";

    // Create profile data state
    const [profileData, setProfileData] = useState<Profile | null>(null);

    // Use useEffect to handle authentication check instead of conditional rendering

    // Only fetch profile if authenticated and userId exists
    const {
        data: response,
        isLoading,
        error,
        refetch,
        isUninitialized,
    } = useGetProfileQuery(userId as string, {
        skip: !userId || !isAuthenticated,
    });

    const [changePassword] = useChangePasswordMutation();

    useEffect(() => {
        if (response?.data) {
            setProfileData(response.data as Profile);
        }
    }, [response]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const refreshPromises = [
                refetch(),
            ];

            await Promise.all(refreshPromises);
        } catch (error) {
            console.error("Error refreshing data:", error);
        } finally {
            setRefreshing(false);
        }
    }, [refetch, isAuthenticated, userId]);

    if (!isAuthenticated) return null;

    // Create the data array with header first
    const PROFILE_DATA: ProfileDataItem[] = [
        { id: "header" },
        // only artists get an About Me
        ...(isArtist
            ? [
                {
                    id: "about",
                    type: "section" as const,
                    title: "About Me",
                    content: profileData?.bio ?? null,
                },
            ]
            : []),
        ...PROFILE_SECTIONS,
    ];

    // Calculate offsets for animations
    const offset = headerHeight - headerFinalHeight;

    // Header animations
    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, offset],
        outputRange: [0, -offset],
        extrapolate: "clamp",
    });

    const headerBackgroundOpacity = scrollY.interpolate({
        inputRange: [0, offset - 50, offset],
        outputRange: [0, 0, 1],
        extrapolate: "clamp",
    });

    // Profile image animations
    const imageTranslateY = scrollY.interpolate({
        inputRange: [0, offset],
        outputRange: [0, (headerFinalHeight - imageSize) / 2],
        extrapolate: "clamp",
    });

    const imageTranslateX = scrollY.interpolate({
        inputRange: [0, offset],
        outputRange: [0, -width / 2 + imageFinalSize + 50],
        extrapolate: "clamp",
    });

    const imageScale = scrollY.interpolate({
        inputRange: [0, offset],
        outputRange: [1, imageFinalSize / imageSize],
        extrapolate: "clamp",
    });

    // Name animations
    const nameTranslateX = scrollY.interpolate({
        inputRange: [0, offset / 2, offset],
        outputRange: [0, 0, -width / 2 + nameWidth / 2 + imageFinalSize + 60],
        extrapolate: "clamp",
    });

    const nameTranslateY = scrollY.interpolate({
        inputRange: [0, offset],
        outputRange: [0, -20],
        extrapolate: "clamp",
    });

    const nameScale = scrollY.interpolate({
        inputRange: [0, offset],
        outputRange: [1, 0.8],
        extrapolate: "clamp",
    });

    // Username animations
    const usernameOpacity = scrollY.interpolate({
        inputRange: [0, offset / 2, offset],
        outputRange: [1, 0.5, 0],
        extrapolate: "clamp",
    });

    const resolveAvatar = (
        avatar?: string | number
    ): ImageSourcePropType => {
        if (!avatar) {
            return defaultAvatar
        }

        if (typeof avatar === "number") {
            return avatar
        }

        if (typeof avatar === "string" && (avatar.startsWith("http://") || avatar.startsWith("https://"))) {
            return { uri: avatar }
        }

        switch (avatar) {
            case "@/public/imgs/logo.png":
                return require("@/public/imgs/logo.png")
            default:
                return defaultAvatar
        }
    }

    // Format the full name from firstName and lastName
    const getFullName = () => {
        if (!profileData?.name) return "";
        return `${profileData.name.firstName || ""} ${profileData.name.lastName || ""}`.trim();
    };

    // Get location from address
    const getLocation = () => {
        if (!profileData?.address) return "";
        return `${profileData.address.city || ""}, ${profileData.address.country || ""}`.trim();
    };

    const getStatsData = () => {
        return [
            {
                label: "Playlists",
                value: profileData?.playlists?.toString() || "0"
            },
            {
                label: "Followers",
                value: profileData?.followers?.toString() || "0"
            },
            {
                label: "Following",
                value: profileData?.following?.toString() || "0"
            },
        ];
    };

    const getTopTracks = () => {
        if (!profileData?.latestSong || profileData.latestSong.length === 0) {
            return [];
        }

        return profileData.latestSong.map(track => ({
            id: track.id || String(Math.random()),
            title: track.title || "Unknown Track",
            artist: track.artist || "Unknown Artist",
            image: track.fileUrl || "https://png.pngtree.com/thumb_back/fh260/background/20210207/pngtree-simple-solid-color-on-gray-background-image_557017.jpg"
        }));
    };

    const handleEditProfile = () => {
        router.push("/(profile)/edit");
    };

    const handleChangePassword = () => {
        setPasswordModalVisible(true);
    };

    const resetPasswordForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const closePasswordModal = () => {
        resetPasswordForm();
        setPasswordModalVisible(false);
    };

    const submitPasswordChange = async () => {
        if (!currentPassword) {
            Alert.alert("Error", "Please enter your current password");
            return;
        }

        if (!newPassword) {
            Alert.alert("Error", "Please enter a new password");
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert("Error", "New password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords don't match");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await changePassword({
                userId: userId as string,
                oldPassword: currentPassword,
                newPassword: newPassword,
            }).unwrap();

            await new Promise(resolve => setTimeout(resolve, 1000));

            Alert.alert(
                "Success",
                "Your password has been updated successfully",
                [{ text: "OK", onPress: closePasswordModal }]
            );
        } catch (error) {
            Alert.alert("Error", "Failed to update password. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNotifications = () => {
        router.push("/(profile)/notifications");
    };

    const handlePrivacy = () => {
        router.push("/(profile)/privacy");
    };

    const handleHelp = () => {
        router.push("/(profile)/help");
    };

    const handleLogout = () => {
        logout();
        router.replace("/(tabs)");
    };

    const handleArtistStudio = () => {
        router.push("/(artist)/upload");
    };

    const settingHandlers = {
        "1": handleEditProfile,
        "2": handleChangePassword,
        "3": handleNotifications,
        "4": handlePrivacy,
        "5": handleHelp,
        "6": handleLogout,
    };

    // Renders content for non-header items based on type
    const renderContent = (item: Exclude<ProfileDataItem, ProfileHeader>) => {
        switch (item.type) {
            case "stats":
                const statsItems = getStatsData();

                const statsData = !isArtist
                    ? statsItems.filter((s) => s.label !== "Followers")
                    : statsItems;

                return (
                    <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
                        {statsData.map((stat, i) => (
                            <View key={i} style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.primary }]}>
                                    {stat.value}
                                </Text>
                                <Text style={[styles.statLabel, { color: colors.text }]}>
                                    {stat.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                );
            case "section":
                let sectionContent = item.content;

                if (item.id === "favorites" && profileData?.topGenres?.length) {
                    sectionContent = profileData.topGenres.join(" • ");
                }

                return (
                    <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.sectionContent, { color: colors.text }]}>{sectionContent}</Text>
                    </View>
                );
            case "tracks":
                const trackItems = getTopTracks();

                if (trackItems.length === 0) return null;

                return (
                    <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{item.title}</Text>
                        {trackItems.map((track) => (
                            <View key={track.id} style={styles.trackItem}>
                                <Image source={{ uri: track.image }} style={styles.trackImage} />
                                <View style={styles.trackInfo}>
                                    <Text style={[styles.trackTitle, { color: colors.text }]}>{track.title}</Text>
                                    <Text style={[styles.trackArtist, { color: colors.text + "99" }]}>{track.artist}</Text>
                                </View>
                                <TouchableOpacity style={styles.trackPlayButton}>
                                    <Ionicons name="play" size={20} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                );
            case "settings":
                return (
                    <View style={[styles.sectionContainer, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
                        {item.items.map((setting) => (
                            <TouchableOpacity
                                key={setting.id}
                                style={styles.settingItem}
                                onPress={() => {
                                    // Call the appropriate handler function
                                    const handler = settingHandlers[setting.id as keyof typeof settingHandlers];
                                    if (handler) {
                                        handler();
                                    }
                                }}
                            >
                                <Ionicons name={setting.icon as any} size={22} color={colors.text} style={styles.settingIcon} />
                                <Text style={[styles.settingTitle, { color: colors.text }]}>{setting.title}</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.text + "80"} />
                            </TouchableOpacity>
                        ))}
                    </View>
                );
            default:
                return null;
        }
    };

    // Render function for each list item
    const renderItem = ({ item, index }: ListRenderItemInfo<ProfileDataItem>) => {
        if (index === 0) {
            // Render header item
            return (
                <Animated.View
                    style={[
                        styles.header,
                        {
                            transform: [{ translateY: headerTranslateY }],
                            paddingTop: insets.top,
                        },
                    ]}
                >
                    {/* Gradient Background */}
                    <LinearGradient
                        colors={isDark ? ["#1A1A1A", "#333333"] : ["#FF6B9B", "#FF3B30"]}
                        style={styles.headerGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />

                    {/* Header Background for when scrolled */}
                    <Animated.View
                        style={[
                            styles.headerBackground,
                            {
                                backgroundColor: colors.background,
                                opacity: headerBackgroundOpacity,
                            },
                        ]}
                    />

                    {/* Profile Image */}
                    <Animated.View
                        style={[
                            styles.imageContainer,
                            {
                                transform: [
                                    { translateY: imageTranslateY },
                                    { translateX: imageTranslateX },
                                    { scale: imageScale },
                                ],
                            },
                        ]}
                    >
                        <Image
                            source={ resolveAvatar(profileData?.avatar) }
                            style={styles.profileImage}
                        />
                    </Animated.View>

                    {/* Name */}
                    <Animated.Text
                        onTextLayout={(e) => setNameWidth(e.nativeEvent.lines[0]?.width || 0)}
                        style={[
                            styles.name,
                            {
                                color: "#FFFFFF",
                                transform: [
                                    { translateX: nameTranslateX },
                                    { translateY: nameTranslateY },
                                    { scale: nameScale },
                                ],
                            },
                        ]}
                    >
                        {getFullName()}
                    </Animated.Text>

                    {/* Stage Name */}
                    {isArtist && (
                        <Animated.Text
                            onTextLayout={(e) => setUsernameWidth(e.nativeEvent.lines[0]?.width || 0)}
                            style={[
                                styles.username,
                                {
                                    color: isDark ? "#FFFFFF99" : "#FFFFFFCC",
                                    opacity: usernameOpacity,
                                },
                            ]}
                        >
                            {profileData?.stageName
                                ? `${profileData.stageName} • ${getLocation()}`
                                : getLocation()}
                        </Animated.Text>
                    )}

                    {/* Header Actions */}
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.headerActionButton, { backgroundColor: "rgba(255, 255, 255, 0.2)" }]}
                            onPress={toggleTheme}
                        >
                            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.headerActionButton, { backgroundColor: "rgba(255, 255, 255, 0.2)" }]}
                        >
                            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            );
        }
        // Render non-header items by calling renderContent.
        return <View style={styles.contentItem}>{renderContent(item as Exclude<ProfileDataItem, ProfileHeader>)}</View>;
    };

    const renderPasswordModal = () => (
        <ChangePasswordModal
            passwordModalVisible={passwordModalVisible}
            closePasswordModal={closePasswordModal}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            showCurrentPassword={showCurrentPassword}
            setShowCurrentPassword={setShowCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            isSubmitting={isSubmitting}
            submitPasswordChange={submitPasswordChange}
            newPasswordRef={newPasswordRef}
            confirmPasswordRef={confirmPasswordRef}
        />
    )

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <Animated.FlatList
                data={PROFILE_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                stickyHeaderIndices={[0]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                        title="Pull to refresh..."
                        titleColor={colors.text}
                    />
                }
            />

            {isArtist && (
                <TouchableOpacity
                    style={[
                        styles.artistFAB,
                        {
                            backgroundColor: colors.primary,
                            bottom: playerStore.currentSong ? 80 : 20
                        }
                    ]}
                    onPress={handleArtistStudio}
                >
                    <Ionicons name="musical-notes" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            )}

            {renderPasswordModal()}
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: headerHeight,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        overflow: "hidden",
    },
    headerGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    headerBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    imageContainer: {
        height: imageSize,
        width: imageSize,
        borderRadius: imageSize / 2,
        borderWidth: 4,
        borderColor: "#FFFFFF",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    profileImage: {
        height: "100%",
        width: "100%",
    },
    name: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 15,
    },
    username: {
        fontSize: 16,
        marginTop: 5,
    },
    headerActions: {
        position: "absolute",
        top: Platform.OS === "ios" ? 50 : 40,
        right: 20,
        flexDirection: "row",
    },
    headerActionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 10,
    },
    artistFAB: {
        position: "absolute",
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
        zIndex: 1000,
        marginBottom: 80,
    },
    contentItem: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: "row",
        borderRadius: 16,
        padding: 16,
        justifyContent: "space-around",
    },
    statItem: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 14,
    },
    sectionContainer: {
        borderRadius: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    sectionContent: {
        fontSize: 15,
        lineHeight: 22,
    },
    activityItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    activityIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 2,
    },
    activitySubtitle: {
        fontSize: 13,
    },
    activityTime: {
        fontSize: 12,
    },
    trackItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
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
        fontSize: 15,
        fontWeight: "500",
        marginBottom: 2,
    },
    trackArtist: {
        fontSize: 13,
    },
    trackPlayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.05)",
    },
    settingIcon: {
        marginRight: 12,
    },
    settingTitle: {
        flex: 1,
        fontSize: 16,
    },
});