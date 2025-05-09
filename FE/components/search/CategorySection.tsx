"use client"

import type React from "react"
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"

// Mock data for categories
const CATEGORIES = [
    { id: "1", name: "Pop", icon: "musical-note", color: "#FF6B9B" },
    { id: "2", name: "Rock", icon: "musical-notes", color: "#5856D6" },
    { id: "3", name: "Hip Hop", icon: "headset", color: "#FF9500" },
    { id: "4", name: "Electronic", icon: "pulse", color: "#5AC8FA" },
    { id: "5", name: "Jazz", icon: "radio", color: "#FFCC00" },
    { id: "6", name: "Classical", icon: "musical-note", color: "#FF3B30" },
    { id: "7", name: "R&B", icon: "musical-notes", color: "#34C759" },
    { id: "8", name: "Country", icon: "headset", color: "#AF52DE" },
]

const CategorySection: React.FC = () => {
    const { colors, isDark } = useTheme()

    // Render category item
    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                {
                    backgroundColor: item.color + (isDark ? "40" : "20"),
                },
            ]}
        >
            <View style={[styles.categoryIconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
        </TouchableOpacity>
    )

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse Categories</Text>
            <FlatList
                data={CATEGORIES}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.categoriesContainer}
                scrollEnabled={false}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    section: {
        marginTop: 32,
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
    categoriesContainer: {
        paddingBottom: 8,
    },
    categoryItem: {
        flex: 1,
        margin: 6,
        height: 100,
        borderRadius: 16,
        padding: 16,
        justifyContent: "space-between",
    },
    categoryIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    categoryName: {
        fontSize: 16,
        fontWeight: "bold",
    },
})

export default CategorySection