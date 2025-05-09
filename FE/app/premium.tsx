"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"

const PremiumScreen = () => {
    const { colors, isDark } = useTheme()
    const router = useRouter()
    const [selectedPlan, setSelectedPlan] = useState("monthly")
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null)

    const handleSubscribe = () => {
        if (!paymentMethod) {
            // Show error or prompt to select payment method
            return
        }

        if (paymentMethod === "momo") {
            const amount = selectedPlan === "monthly" ? 9.99 : 95.88
            const path = "/(payment)/momo/[amount]"
            const params = { amount: amount.toString() }

            router.push({ pathname: path, params })
        } else if (paymentMethod === "stripe") {
            router.push("/(payment)/stripe")
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <LinearGradient colors={["#FF6B9B", "#FF8E53"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Premium</Text>
                    <Text style={styles.headerSubtitle}>Elevate your music experience</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Benefits Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Why Go Premium?</Text>

                    <View style={styles.benefitsList}>
                        <View style={styles.benefitItem}>
                            <View style={[styles.benefitIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.benefitText}>
                                <Text style={[styles.benefitTitle, { color: colors.text }]}>Ad-free Music</Text>
                                <Text style={[styles.benefitDescription, { color: colors.secondary }]}>
                                    Enjoy uninterrupted music without ads
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitItem}>
                            <View style={[styles.benefitIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="download" size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.benefitText}>
                                <Text style={[styles.benefitTitle, { color: colors.text }]}>Offline Listening</Text>
                                <Text style={[styles.benefitDescription, { color: colors.secondary }]}>
                                    Download music and listen offline
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitItem}>
                            <View style={[styles.benefitIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.benefitText}>
                                <Text style={[styles.benefitTitle, { color: colors.text }]}>High Quality Audio</Text>
                                <Text style={[styles.benefitDescription, { color: colors.secondary }]}>
                                    Experience music in superior sound quality
                                </Text>
                            </View>
                        </View>

                        <View style={styles.benefitItem}>
                            <View style={[styles.benefitIcon, { backgroundColor: colors.primary }]}>
                                <Ionicons name="shuffle" size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.benefitText}>
                                <Text style={[styles.benefitTitle, { color: colors.text }]}>Unlimited Skips</Text>
                                <Text style={[styles.benefitDescription, { color: colors.secondary }]}>
                                    Skip as many tracks as you want
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Plans Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Your Plan</Text>

                    <View style={styles.planSelector}>
                        <TouchableOpacity
                            style={[
                                styles.planOption,
                                selectedPlan === "monthly" && [styles.selectedPlan, { borderColor: colors.primary }],
                            ]}
                            onPress={() => setSelectedPlan("monthly")}
                        >
                            <Text
                                style={[
                                    styles.planName,
                                    { color: colors.text },
                                    selectedPlan === "monthly" && { color: colors.primary },
                                ]}
                            >
                                Monthly
                            </Text>
                            <Text style={[styles.planPrice, { color: colors.text }]}>$9.99</Text>
                            <Text style={[styles.planBilling, { color: colors.secondary }]}>per month</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.planOption,
                                selectedPlan === "yearly" && [styles.selectedPlan, { borderColor: colors.primary }],
                            ]}
                            onPress={() => setSelectedPlan("yearly")}
                        >
                            <View style={styles.saveBadge}>
                                <Text style={styles.saveText}>SAVE 20%</Text>
                            </View>
                            <Text
                                style={[
                                    styles.planName,
                                    { color: colors.text },
                                    selectedPlan === "yearly" && { color: colors.primary },
                                ]}
                            >
                                Yearly
                            </Text>
                            <Text style={[styles.planPrice, { color: colors.text }]}>$95.88</Text>
                            <Text style={[styles.planBilling, { color: colors.secondary }]}>$7.99/month</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Payment Methods */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            { backgroundColor: colors.card },
                            paymentMethod === "momo" && { borderColor: colors.primary, borderWidth: 2 },
                        ]}
                        onPress={() => setPaymentMethod("momo")}
                    >
                        <Image source={{ uri: "/placeholder.svg?height=40&width=40" }} style={styles.paymentIcon} />
                        <Text style={[styles.paymentName, { color: colors.text }]}>MoMo</Text>
                        {paymentMethod === "momo" && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.checkIcon} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            { backgroundColor: colors.card },
                            paymentMethod === "stripe" && { borderColor: colors.primary, borderWidth: 2 },
                        ]}
                        onPress={() => setPaymentMethod("stripe")}
                    >
                        <Image source={{ uri: "/placeholder.svg?height=40&width=40" }} style={styles.paymentIcon} />
                        <Text style={[styles.paymentName, { color: colors.text }]}>Credit Card (Stripe)</Text>
                        {paymentMethod === "stripe" && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.checkIcon} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Terms and Conditions */}
                <Text style={[styles.termsText, { color: colors.secondary }]}>
                    By subscribing, you agree to our Terms of Service and Privacy Policy. Your subscription will automatically
                    renew unless canceled at least 24 hours before the end of the current period.
                </Text>
            </ScrollView>

            {/* Subscribe Button */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    style={[styles.subscribeButton, { opacity: paymentMethod ? 1 : 0.6 }]}
                    onPress={handleSubscribe}
                    disabled={!paymentMethod}
                >
                    <LinearGradient
                        colors={["#FF6B9B", "#FF8E53"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
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
    header: {
        paddingTop: Platform.OS === "ios" ? 50 : 30,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    headerContent: {
        paddingHorizontal: 10,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
    benefitsList: {
        marginBottom: 10,
    },
    benefitItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    benefitIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    benefitText: {
        flex: 1,
    },
    benefitTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    benefitDescription: {
        fontSize: 14,
    },
    planSelector: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    planOption: {
        width: "48%",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "transparent",
        alignItems: "center",
        position: "relative",
    },
    selectedPlan: {
        borderWidth: 2,
    },
    saveBadge: {
        position: "absolute",
        top: -10,
        right: -10,
        backgroundColor: "#FF6B9B",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    saveText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "bold",
    },
    planName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    planPrice: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
    },
    planBilling: {
        fontSize: 14,
    },
    paymentOption: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    paymentIcon: {
        width: 40,
        height: 40,
        marginRight: 16,
    },
    paymentName: {
        fontSize: 16,
        fontWeight: "500",
        flex: 1,
    },
    checkIcon: {
        marginLeft: 8,
    },
    termsText: {
        fontSize: 12,
        textAlign: "center",
        marginBottom: 100,
        paddingHorizontal: 20,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 20,
        borderTopWidth: 1,
        borderTopColor: "rgba(0, 0, 0, 0.1)",
    },
    subscribeButton: {
        borderRadius: 30,
        overflow: "hidden",
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: "center",
        borderRadius: 30,
    },
    subscribeButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
})

export default PremiumScreen