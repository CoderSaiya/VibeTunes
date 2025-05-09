"use client"

import { useEffect } from "react"
import { View, ActivityIndicator, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { useTheme } from "@/context/ThemeContext"

export default function LogoutScreen() {
    const { colors } = useTheme()
    const router = useRouter()

    useEffect(() => {
        const performLogout = async () => {
            // Use the context logout function
            // logout()

            // Redirect to welcome screen
            setTimeout(() => {
                router.replace("/auth/welcome")
            }, 1000)
        }

        performLogout()
    }, [])

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
})