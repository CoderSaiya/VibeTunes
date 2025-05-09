"use client"

import { useRef, useState } from "react"
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated, Image } from "react-native"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"

const { width, height } = Dimensions.get("window")

interface OnboardingItem {
    id: string
    title: string
    description: string
    image: any
}

const onboardingData: OnboardingItem[] = [
    {
        id: "1",
        title: "Discover Music Together",
        description: "Find and join music rooms where people share their favorite tracks in real-time.",
        image: require("@/assets//images/favicon.png"),
    },
    {
        id: "2",
        title: "Create Your Own Room",
        description: "Start your own music room and become a DJ for your friends and followers.",
        image: require("@/assets//images/favicon.png"),
    },
    {
        id: "3",
        title: "Listen in Sync",
        description: "Experience music in perfect synchronization with everyone in the room.",
        image: require("@/assets//images/favicon.png"),
    },
]

export default function WelcomeScreen() {
    const { colors, isDark } = useTheme()
    const router = useRouter()
    const [currentIndex, setCurrentIndex] = useState(0)
    const slidesRef = useRef<FlatList>(null)
    const scrollX = useRef(new Animated.Value(0)).current

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        setCurrentIndex(viewableItems[0]?.index || 0)
    }).current

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

    const scrollTo = (index: number) => {
        if (slidesRef.current) {
            slidesRef.current.scrollToIndex({ index })
        }
    }

    const nextSlide = () => {
        if (currentIndex < onboardingData.length - 1) {
            scrollTo(currentIndex + 1)
        } else {
            // Last slide, navigate to auth
            router.replace("./auth/welcome")
        }
    }

    const skipToAuth = () => {
        router.replace("./auth/welcome")
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <View style={styles.topBar}>
                {currentIndex > 0 ? (
                    <TouchableOpacity style={styles.backButton} onPress={() => scrollTo(currentIndex - 1)}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.backButton} />
                )}

                <TouchableOpacity style={styles.skipButton} onPress={skipToAuth}>
                    <Text style={[styles.skipText, { color: colors.text }]}>Skip</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={onboardingData}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <Image source={item.image} style={styles.image} resizeMode="contain" />
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.description, { color: colors.text }]}>{item.description}</Text>
                        </View>
                    </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
                scrollEventThrottle={32}
            />

            <View style={styles.bottomContainer}>
                <View style={styles.pagination}>
                    {onboardingData.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width]

                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 20, 10],
                            extrapolate: "clamp",
                        })

                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: "clamp",
                        })

                        return (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.dot,
                                    {
                                        width: dotWidth,
                                        opacity,
                                        backgroundColor: colors.primary,
                                    },
                                ]}
                            />
                        )
                    })}
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
                    <LinearGradient
                        colors={["#FF6B9B", "#FF3B30"]}
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons
                            name={currentIndex === onboardingData.length - 1 ? "checkmark" : "arrow-forward"}
                            size={24}
                            color="#FFFFFF"
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        fontSize: 16,
        fontWeight: "500",
    },
    slide: {
        width,
        alignItems: "center",
        padding: 20,
    },
    image: {
        width: width * 0.8,
        height: height * 0.5,
        marginTop: 20,
    },
    textContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: "center",
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    bottomContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    pagination: {
        flexDirection: "row",
        height: 40,
        alignItems: "center",
    },
    dot: {
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    nextButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: "hidden",
    },
    gradient: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
})