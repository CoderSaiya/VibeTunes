"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"

// Mock data for trending searches
const TRENDING_SEARCHES = [
    "Summer Hits 2023",
    "Taylor Swift",
    "Hip Hop Classics",
    "Workout Mix",
    "Chill Vibes",
    "Top 50 Global",
]

interface TrendingSearchesProps {
    onTrendingItemPress: (item: string) => void
}

const TrendingSearches: React.FC<TrendingSearchesProps> = ({ onTrendingItemPress }) => {
    const { colors } = useTheme()

    // Render trending search item
    const renderTrendingItem = (item: string, index: number) => (
        <TouchableOpacity
            key={index}
            style={[styles.trendingItem, { backgroundColor: colors.card }]}
            onPress={() => onTrendingItemPress(item)}
        >
            <Ionicons name="trending-up" size={18} color={colors.primary} style={styles.trendingIcon} />
            <Text style={[styles.trendingText, { color: colors.text }]}>{item}</Text>
        </TouchableOpacity>
    )

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Searches</Text>
            <View style={styles.trendingContainer}>
                {TRENDING_SEARCHES.map((item, index) => renderTrendingItem(item, index))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
    trendingContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    trendingItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    trendingIcon: {
        marginRight: 6,
    },
    trendingText: {
        fontSize: 14,
    },
})

export default TrendingSearches