"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"
import { useRoomStore } from "@/store/roomStore";
import {useRouter} from "expo-router";
import {MusicRoom} from "@/types/room";

const RoomsScreen: React.FC = () => {
    const { colors } = useTheme()
    const router = useRouter()
    const { initConnection, rooms, isLoading, joinRoom, fetchRooms } = useRoomStore()
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        initConnection()
            .then(() => {
                fetchRooms();
            })
            .catch(err => console.error("SignalR init failed:", err));
    }, []);

    const onRefresh = async () => {
        setRefreshing(true)
        fetchRooms()
        setRefreshing(false)
    }

    const handleJoinRoom = async (roomId: string) => {
        try {
            await joinRoom(roomId)
            router.push("/(room)/room-detail")
        } catch (error) {
            console.error("Error joining room:", error)
        }
    }

    const handleCreateRoom = () => {
        router.push("/(room)/create-room")
    }

    const renderRoomItem = ({ item }: { item: MusicRoom }) => (
        <TouchableOpacity
            style={[styles.roomItem, { backgroundColor: colors.card }]}
            onPress={() => handleJoinRoom(item.id)}
        >
            <View style={styles.roomInfo}>
                <Text style={[styles.roomName, { color: colors.text }]} numberOfLines={1}>
                    {item.id}
                </Text>
                <View style={styles.roomMeta}>
                    <Text style={[styles.roomOwner, { color: colors.text }]}>
                        Host: {item.hostId}
                    </Text>
                    <View style={styles.listenersInfo}>
                        <Ionicons name="people" size={16} color={colors.text} />
                        <Text style={[styles.listenersCount, { color: colors.text }]}>
                            {item.participants.length}
                        </Text>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
    )

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Music Rooms</Text>
                <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.primary }]} onPress={handleCreateRoom}>
                    <Ionicons name="add" size={24} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Create Room</Text>
                </TouchableOpacity>
            </View>

            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={rooms}
                    renderItem={renderRoomItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="musical-notes" size={64} color={colors.text} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>No music rooms available</Text>
                            <Text style={[styles.emptySubText, { color: colors.text }]}>Create a room to start sharing music!</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
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
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingVertical: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    createButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        marginLeft: 5,
    },
    listContent: {
        padding: 15,
    },
    roomItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    roomInfo: {
        flex: 1,
    },
    roomName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    roomDescription: {
        fontSize: 14,
        marginBottom: 8,
    },
    roomMeta: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    roomOwner: {
        fontSize: 12,
    },
    listenersInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    listenersCount: {
        fontSize: 12,
        marginLeft: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
    },
    emptySubText: {
        fontSize: 14,
        marginTop: 10,
        textAlign: "center",
        paddingHorizontal: 40,
    },
})

export default RoomsScreen