"use client"
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"
import {User} from "@/types/user";

const LibraryHeader = (user : User) => {
    const { colors } = useTheme()

    return (
        <View style={[styles.container, { paddingTop: Platform.OS === "ios" ? 50 : 30 }]}>
            <View style={styles.headerTop}>
                <View style={styles.userInfo}>
                    {user?.avatar ? (
                        <Image source={{ uri: user.avatar || "" }} style={styles.profileImage} />
                    ) : (
                        <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
                            <Text style={styles.profileInitial}>{user?.lastName?.charAt(0) || "U"}</Text>
                        </View>
                    )}
                    <Text style={[styles.title, { color: colors.text }]}>Your Library</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="search" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="add" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.filters}>
                <TouchableOpacity style={[styles.filterChip, { backgroundColor: colors.card }]}>
                    <Text style={[styles.filterText, { color: colors.text }]}>Playlists</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterChip, { backgroundColor: colors.card }]}>
                    <Text style={[styles.filterText, { color: colors.text }]}>Artists</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterChip, { backgroundColor: colors.card }]}>
                    <Text style={[styles.filterText, { color: colors.text }]}>Albums</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterChip, { backgroundColor: colors.card }]}>
                    <Text style={[styles.filterText, { color: colors.text }]}>Downloaded</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sortRow}>
                <TouchableOpacity style={styles.sortButton}>
                    <Ionicons name="swap-vertical" size={18} color={colors.secondary} />
                    <Text style={[styles.sortText, { color: colors.secondary }]}>Recents</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.gridButton}>
                    <Ionicons name="grid-outline" size={18} color={colors.secondary} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    profileImagePlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    profileInitial: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    actions: {
        flexDirection: "row",
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    filters: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 16,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    filterText: {
        fontSize: 14,
        fontWeight: "500",
    },
    sortRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    sortText: {
        marginLeft: 4,
        fontSize: 14,
    },
    gridButton: {
        padding: 4,
    },
})

export default LibraryHeader