"use client"

import React, { useEffect, useRef } from "react"
import { View, StyleSheet, Animated, Dimensions, Easing } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "@/context/ThemeContext"

const { width, height } = Dimensions.get("window")

interface BubbleProps {
    size: number
    position: { x: number; y: number }
    colors: readonly [string, string]  // Use tuple type
    duration: number
    delay: number
}

const Bubble: React.FC<BubbleProps> = ({ size, position, colors, duration, delay }) => {
    const scale = useRef(new Animated.Value(0)).current
    const translateX = useRef(new Animated.Value(0)).current
    const translateY = useRef(new Animated.Value(0)).current
    const opacity = useRef(new Animated.Value(0)).current

    // Track mounted state
    const mounted = useRef(true)
    useEffect(() => {
        return () => {
            mounted.current = false
        }
    }, [])

    const startAnimation = () => {
        // Random movement range
        const xMove = Math.random() * 100 - 50 // -50 to 50
        const yMove = -Math.random() * 200 - 50 // -50 to -250 (upward)

        Animated.parallel([
            // Scale up and fade in
            Animated.timing(scale, {
                toValue: 1,
                duration: duration * 0.3,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(opacity, {
                toValue: 0.7,
                duration: duration * 0.3,
                useNativeDriver: true,
            }),
            // Move bubble
            Animated.timing(translateX, {
                toValue: xMove,
                duration: duration,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }),
            Animated.timing(translateY, {
                toValue: yMove,
                duration: duration,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
            }),
            // Fade out near the end
            Animated.sequence([
                Animated.delay(duration * 0.7),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: duration * 0.3,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            // Reset values and restart animation
            scale.setValue(0)
            translateX.setValue(0)
            translateY.setValue(0)
            opacity.setValue(0)

            // Restart with a slight delay if still mounted
            setTimeout(() => {
                if (mounted.current) {
                    startAnimation()
                }
            }, Math.random() * 1000)
        })
    }

    useEffect(() => {
        Animated.sequence([
            // Delay start
            Animated.delay(delay),
            // Start animation
            Animated.parallel([
                // Scale up and fade in
                Animated.timing(scale, {
                    toValue: 1,
                    duration: duration * 0.3,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                }),
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: duration * 0.3,
                    useNativeDriver: true,
                }),
                // Move bubble
                Animated.timing(translateX, {
                    toValue: Math.random() * 100 - 50, // -50 to 50
                    duration: duration,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(translateY, {
                    toValue: -Math.random() * 200 - 50, // -50 to -250 (upward)
                    duration: duration,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                // Fade out near the end
                Animated.sequence([
                    Animated.delay(duration * 0.7),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: duration * 0.3,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]).start(() => {
            // Reset values and restart animation
            scale.setValue(0)
            translateX.setValue(0)
            translateY.setValue(0)
            opacity.setValue(0)

            // Restart with a slight delay if still mounted
            setTimeout(() => {
                if (mounted.current) {
                    startAnimation()
                }
            }, Math.random() * 1000)
        })
    }, [delay, duration, scale, translateX, translateY, opacity])

    return (
        <Animated.View
            style={[
                styles.bubble,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    left: position.x,
                    bottom: position.y,
                    opacity,
                    transform: [{ scale }, { translateX }, { translateY }],
                },
            ]}
        >
            <LinearGradient
                colors={colors}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
        </Animated.View>
    )
}

const Background: React.FC = () => {
    const { isDark } = useTheme()

    // Generate random bubbles
    const generateBubbles = () => {
        const bubbles = []
        const count = 15 // Number of bubbles

        const lightColors: readonly [string, string][] = [
            ["#FF6B9B", "#FF3B30"],
            ["#FF9F7F", "#FF6B9B"],
            ["#FF3B30", "#FF9F7F"],
        ]

        const darkColors: readonly [string, string][] = [
            ["#FF6B9B", "#FF3B30"],
            ["#FF9F7F", "#FF6B9B"],
            ["#FF3B30", "#FF9F7F"],
        ]

        const colorSets = isDark ? darkColors : lightColors

        for (let i = 0; i < count; i++) {
            const size = Math.random() * 100 + 50 // 50-150
            const posX = Math.random() * width
            const posY = Math.random() * (height / 3)
            const colorIndex = Math.floor(Math.random() * colorSets.length)
            const duration = Math.random() * 5000 + 8000 // 8-13 seconds
            const delay = Math.random() * 5000 // 0-5 seconds delay

            bubbles.push(
                <Bubble
                    key={i}
                    size={size}
                    position={{ x: posX, y: posY }}
                    colors={colorSets[colorIndex]}
                    duration={duration}
                    delay={delay}
                />
            )
        }

        return bubbles
    }

    return (
        <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f5f5f5" }]}>
            {generateBubbles()}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        overflow: "hidden",
    },
    bubble: {
        position: "absolute",
        overflow: "hidden",
    },
    gradient: {
        width: "100%",
        height: "100%",
        borderRadius: 999,
    },
})

export default Background