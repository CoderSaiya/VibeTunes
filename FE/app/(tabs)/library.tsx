"use client"

import type React from "react"
import { View, Text as RNText, StyleSheet } from "react-native"
import { useTheme } from "@/context/ThemeContext"

const Text = RNText

const LibraryScreen: React.FC = () => {
    const { colors } = useTheme()

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.text, { color: colors.text }]}>Library Screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 20,
        fontWeight: "bold",
    },
})

export default LibraryScreen