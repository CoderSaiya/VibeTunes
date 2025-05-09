"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useTheme } from "@/context/ThemeContext"

interface LibraryTabsProps {
    activeTab: string
    onChangeTab: (tab: string) => void
}

const LibraryTabs: React.FC<LibraryTabsProps> = ({ activeTab, onChangeTab }) => {
    const { colors } = useTheme()

    const tabs = [
        { id: "playlists", label: "Playlists" },
        { id: "albums", label: "Albums" },
        { id: "artists", label: "Artists" },
        { id: "downloads", label: "Downloads" },
    ]

    return (
        <View style={[styles.container, { borderBottomColor: colors.border }]}>
            {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab.id}
                    style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                    onPress={() => onChangeTab(tab.id)}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: colors.secondary },
                            activeTab === tab.id && { color: colors.text, fontWeight: "600" },
                        ]}
                    >
                        {tab.label}
                    </Text>
                    {activeTab === tab.id && <View style={[styles.indicator, { backgroundColor: colors.primary }]} />}
                </TouchableOpacity>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        paddingHorizontal: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
        position: "relative",
    },
    activeTab: {},
    tabText: {
        fontSize: 16,
    },
    indicator: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
})

export default LibraryTabs