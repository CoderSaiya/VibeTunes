"use client"

import { useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"

const PaymentSuccessScreen = () => {
    const { colors, isDark } = useTheme()
    const router = useRouter()
    const scaleAnim = new Animated.Value(0.5)
    const opacityAnim = new Animated.Value(0)

    useEffect(() => {
        // Animation sequence
        Animated.sequence([
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    const handleContinue = () => {
        router.push("/(tabs)")
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <LinearGradient
                colors={["#FF6B9B", "#FF8E53"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.background}
            />

            <Animated.View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    },
                ]}
            >
                <View style={styles.successIconContainer}>
                    <View style={styles.successIconOuter}>
                        <View style={styles.successIconInner}>
                            <Ionicons name="checkmark" size={50} color="#FFFFFF" />
                        </View>
                    </View>
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Payment Successful!</Text>

                <Text style={[styles.description, { color: colors.secondary }]}>
                    Your premium subscription has been activated. Enjoy ad-free music, offline listening, and more!
                </Text>

                <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.secondary }]}>Plan</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>Premium Monthly</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.secondary }]}>Amount</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>$9.99</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.secondary }]}>Next Billing</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>
                            {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                    <LinearGradient
                        colors={["#FF6B9B", "#FF8E53"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.continueButtonText}>Start Listening</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    background: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.8,
    },
    card: {
        width: "85%",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    successIconContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    successIconOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    successIconInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    detailsContainer: {
        width: "100%",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        width: "100%",
    },
    continueButton: {
        width: "100%",
        borderRadius: 30,
        overflow: "hidden",
        marginTop: 10,
        marginBottom: 20,
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: "center",
        borderRadius: 30,
    },
    continueButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
})

export default PaymentSuccessScreen