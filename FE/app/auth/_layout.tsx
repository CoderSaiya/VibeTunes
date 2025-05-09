"use client"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useTheme } from "@/context/ThemeContext"

export default function AuthLayout() {
    const { isDark } = useTheme()

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: "fade",
                    contentStyle: { backgroundColor: "transparent" },
                }}
            />
        </>
    )
}