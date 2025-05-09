"use client"

import React, {useEffect, useState} from "react"
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    Alert, RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Stack, useRouter } from "expo-router"
import { useTheme } from "@/context/ThemeContext"
import { useRoomStore } from "@/store/roomStore"
import {HubConnectionState} from "@microsoft/signalr";

const CreateRoomScreen: React.FC = () => {
    const { colors } = useTheme()
    const router = useRouter()
    const { initConnection, createRoom, isLoading, currentRoom, connection } = useRoomStore()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isConnecting, setIsConnecting] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        const setupConnection = async () => {
            if (connection?.state === HubConnectionState.Connected) return

            setIsConnecting(true)
            try {
                await retryAsync(() => initConnection(), {
                    maxAttempts: 3,
                    delay: 2000
                })
            } catch (error) {
                Alert.alert("Connection Error", "Failed to connect after multiple attempts. Please check your network.")
            } finally {
                setIsConnecting(false)
            }
        }

        setupConnection()

        return () => {
        }
    }, [])

    async function retryAsync<T>(
        fn: () => Promise<T>,
        options: { maxAttempts: number; delay: number }
    ): Promise<T> {
        let attempt = 0
        while (attempt < options.maxAttempts) {
            try {
                return await fn()
            } catch (error) {
                attempt++
                if (attempt >= options.maxAttempts) throw error
                await new Promise(resolve => setTimeout(resolve, options.delay))
            }
        }
        throw new Error('Max attempts reached')
    }

    // Theo dõi khi currentRoom thay đổi để điều hướng
    useEffect(() => {
        if (currentRoom) {
            console.log("CurrentRoom updated: ", currentRoom)
            router.push("/(room)/room-detail")
        }
    }, [currentRoom, router])

    const handleCreateRoom = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a room name")
            return
        }

        if (!connection) {
            Alert.alert("Error", "Not connected to server. Please wait or restart the app.")
            return
        }

        try {
            console.log(connection.baseUrl)
            await createRoom(name)
            router.push("/(room)/room-detail")
        } catch (error) {
            console.error("Error creating room:", error)
            Alert.alert("Error", "Failed to create room. Please try again.")
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await initConnection()
        setRefreshing(false)
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Create Music Room</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
            >
                {isConnecting && (
                    <View style={styles.connectingContainer}>
                        <ActivityIndicator color={colors.primary} size="large" />
                        <Text style={[styles.connectingText, { color: colors.text }]}>
                            Connecting to server...
                        </Text>
                    </View>
                )}

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Room Name *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.card,
                                color: colors.text,
                                borderColor: colors.border,
                            },
                        ]}
                        placeholder="Enter room name"
                        placeholderTextColor={colors.text + "80"}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                            {
                                backgroundColor: colors.card,
                                color: colors.text,
                                borderColor: colors.border,
                            },
                        ]}
                        placeholder="Enter room description"
                        placeholderTextColor={colors.text + "80"}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.createButton,
                        { backgroundColor: colors.primary },
                        (isLoading || isConnecting) && styles.disabledButton
                    ]}
                    onPress={handleCreateRoom}
                    disabled={isLoading || isConnecting || !connection}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
                            <Text style={styles.createButtonText}>
                                {!connection ? "Connecting..." : "Create Room"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
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
        paddingVertical: 15,
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    content: {
        padding: 20,
    },
    connectingContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        padding: 10,
    },
    connectingText: {
        marginTop: 10,
        fontSize: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    textArea: {
        height: 120,
        paddingTop: 15,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        borderRadius: 25,
        marginTop: 20,
    },
    createButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
    disabledButton: {
        opacity: 0.7,
    },
})

export default CreateRoomScreen;