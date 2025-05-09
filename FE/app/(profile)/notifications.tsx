// app/setting/notification-history.tsx
"use client";
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Define notification type
type Notification = {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: "social" | "content" | "system";
};

const NotificationHistoryScreen: React.FC = () => {
    const { colors } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Mock notifications data
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            title: "New Follower",
            message: "John Doe started following you",
            time: "2 hours ago",
            read: false,
            type: "social",
        },
        {
            id: "2",
            title: "New Music Available",
            message: "Taylor Swift just released a new album",
            time: "Yesterday",
            read: true,
            type: "content",
        },
        {
            id: "3",
            title: "Room Invitation",
            message: "You've been invited to join 'Chill Vibes' room",
            time: "2 days ago",
            read: true,
            type: "social",
        },
        {
            id: "4",
            title: "Account Security",
            message: "Your password was changed successfully",
            time: "1 week ago",
            read: true,
            type: "system",
        },
        {
            id: "5",
            title: "New Feature",
            message: "Check out our new music recommendation engine",
            time: "2 weeks ago",
            read: true,
            type: "system",
        },
    ]);

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate fetching new notifications
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    };

    const markAsRead = (id: string) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification => ({ ...notification, read: true }))
        );
    };

    const getNotificationIcon = (type: "social" | "content" | "system") => {
        switch (type) {
            case "social":
                return "people-outline";
            case "content":
                return "musical-notes-outline";
            case "system":
                return "information-circle-outline";
            default:
                return "notifications-outline";
        }
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                { backgroundColor: item.read ? colors.card : colors.primary + "15" }
            ]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
                <Ionicons name={getNotificationIcon(item.type)} size={24} color={colors.primary} />
            </View>
            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.notificationTime, { color: colors.text + "80" }]}>{item.time}</Text>
                </View>
                <Text style={[styles.notificationMessage, { color: colors.text + "99" }]}>{item.message}</Text>
            </View>
            {!item.read && <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notification History</Text>
                <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                    <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={64} color={colors.text + "50"} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>No notifications yet</Text>
                            <Text style={[styles.emptySubtext, { color: colors.text + "80" }]}>
                                When you receive notifications, they will appear here
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    markAllButton: {
        padding: 8,
    },
    markAllText: {
        fontSize: 14,
        fontWeight: "500",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        padding: 16,
    },
    notificationItem: {
        flexDirection: "row",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: "600",
        flex: 1,
    },
    notificationTime: {
        fontSize: 12,
        marginLeft: 8,
    },
    notificationMessage: {
        fontSize: 14,
        lineHeight: 20,
    },
    unreadIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
        alignSelf: "center",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: "center",
    },
});

export default NotificationHistoryScreen;