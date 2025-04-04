"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { useColorScheme } from "react-native"

type ThemeType = "light" | "dark"

interface ThemeContextType {
    theme: ThemeType
    isDark: boolean
    toggleTheme: () => void
    colors: typeof themes.light
}

const themes = {
    light: {
        background: "#FFFFFF",
        text: "#000000",
        primary: "#FF3B30",
        secondary: "#5856D6",
        card: "#F2F2F7",
        border: "#C7C7CC",
        tabBar: "#FFFFFF",
        tabBarActive: "#FF3B30",
        tabBarInactive: "#8E8E93",
        playerBackground: "#1A1A1A",
        playerText: "#FFFFFF",
    },
    dark: {
        background: "#000000",
        text: "#FFFFFF",
        primary: "#FF3B30",
        secondary: "#5856D6",
        card: "#1C1C1E",
        border: "#38383A",
        tabBar: "#1C1C1E",
        tabBarActive: "#FF3B30",
        tabBarInactive: "#8E8E93",
        playerBackground: "#1A1A1A",
        playerText: "#FFFFFF",
    },
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    isDark: false,
    toggleTheme: () => {},
    colors: themes.light,
})

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const deviceTheme = useColorScheme()
    const [theme, setTheme] = useState<ThemeType>(deviceTheme === "dark" ? "dark" : "light")

    useEffect(() => {
        setTheme(deviceTheme === "dark" ? "dark" : "light")
    }, [deviceTheme])

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    const isDark = theme === "dark"
    const colors = isDark ? themes.dark : themes.light

    return <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)