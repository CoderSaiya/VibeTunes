"use client"

import React, { useState, useEffect } from "react"
import { Pressable, StyleSheet, View, type LayoutChangeEvent, Dimensions } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Path } from "react-native-svg"
import Animated, { useAnimatedStyle, withTiming, useDerivedValue } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"

const AnimatedSvg = Animated.createAnimatedComponent(Svg)
const { width } = Dimensions.get("window")
const TAB_WIDTH = width / 5 // Assuming 5 tabs

const AnimatedTabBar: React.FC<BottomTabBarProps> = ({ state, navigation, descriptors }) => {
    const { colors } = useTheme()
    const { bottom } = useSafeAreaInsets()
    const activeIndex = state.index

    // Store each tab's position information
    const [tabPositions, setTabPositions] = useState<{x: number, width: number}[]>([])
    const [initialLayout, setInitialLayout] = useState(false)

    // Initial positioning based on screen width
    useEffect(() => {
        // Initialize tab positions with estimated values
        const estimatedPositions = state.routes.map((_, index) => ({
            x: index * TAB_WIDTH,
            width: TAB_WIDTH
        }))
        setTabPositions(estimatedPositions)
    }, [state.routes.length])

    // Listen for actual layout measurements
    const handleLayout = (event: LayoutChangeEvent, index: number) => {
        const layout = event.nativeEvent.layout
        setTabPositions(prev => {
            const next = [...prev]
            next[index] = { x: layout.x, width: layout.width }
            return next
        })
        setInitialLayout(true)
    }

    // Compute animated X offset for SVG indicator
    const xOffset = useDerivedValue(() => {
        if (!tabPositions[activeIndex]) {
            // Default position before measurements
            return activeIndex * TAB_WIDTH + (TAB_WIDTH / 2) - 55
        }

        const tabCenter = tabPositions[activeIndex].x + (tabPositions[activeIndex].width / 2)
        // Center the SVG on the tab
        return tabCenter - 55 // Half of SVG width (110/2)
    })

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ translateX: withTiming(xOffset.value, { duration: 300 }) }],
    }))

    return (
        <View style={[styles.tabBar, { backgroundColor: colors.tabBar, paddingBottom: bottom || 10 }]}>
            <AnimatedSvg
                width={110}
                height={60}
                viewBox="0 0 110 60"
                style={[styles.activeBackground, animatedStyles]}
            >
                <Path
                    fill={colors.primary}
                    d="M20 0H0c11.046 0 20 8.953 20 20v5c0 19.33 15.67 35 35 35s35-15.67 35-35v-5c0-11.045 8.954-20 20-20H20z"
                />
            </AnimatedSvg>

            <View style={styles.tabBarContainer}>
                {state.routes.map((route, index) => {
                    const active = index === activeIndex
                    const { options } = descriptors[route.key]

                    return (
                        <TabBarComponent
                            key={route.key}
                            active={active}
                            label={route.name}
                            onLayout={e => handleLayout(e, index)}
                            onPress={() => {
                                if (!active) {
                                    navigation.navigate(route.name)
                                }
                            }}
                            colors={colors}
                        />
                    )
                })}
            </View>
        </View>
    )
}

type TabBarComponentProps = {
    active?: boolean
    label: string
    onLayout: (e: LayoutChangeEvent) => void
    onPress: () => void
    colors: any
}

const TabBarComponent = ({ active, label, onLayout, onPress, colors }: TabBarComponentProps) => {
    const getIcon = (routeName: string, isActive: boolean | undefined) => {
        let iconName = ""
        switch (routeName) {
            case "Home":
                iconName = isActive ? "home" : "home-outline"
                break
            case "Library":
                iconName = isActive ? "library" : "library-outline"
                break
            case "Search":
                iconName = isActive ? "search" : "search-outline"
                break
            case "Rooms":
                iconName = isActive ? "people" : "people-outline"
                break
            case "Profile":
                iconName = isActive ? "person" : "person-outline"
                break
            default:
                iconName = isActive ? "home" : "home-outline"
        }

        return <Ionicons name={iconName as any} size={24} color={isActive ? colors.primary : colors.tabBarInactive} />
    }

    const animatedCircleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withTiming(active ? 1 : 0, { duration: 250 }) }],
    }))

    const animatedIconContainerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: withTiming(active ? -5 : 0, { duration: 250 }) }],
    }))

    return (
        <Pressable onPress={onPress} onLayout={onLayout} style={styles.component}>
            <Animated.View style={[styles.componentCircle, animatedCircleStyle, { backgroundColor: colors.tabBar }]} />
            <Animated.View style={[styles.iconContainer, animatedIconContainerStyle]}>
                {getIcon(label, active)}
            </Animated.View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    tabBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    activeBackground: {
        position: "absolute",
    },
    tabBarContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    component: {
        height: 60,
        width: 60,
        marginTop: -5,
    },
    componentCircle: {
        flex: 1,
        borderRadius: 30,
    },
    iconContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default AnimatedTabBar