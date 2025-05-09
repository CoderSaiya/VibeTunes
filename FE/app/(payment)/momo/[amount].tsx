"use client"

import { useState, useEffect } from "react"
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Platform, Alert} from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import {useCreatePaymentIntentMutation, useGetTransactionStatusQuery} from "@/store/api";
import * as WebBrowser from 'expo-web-browser'
import {PaymentRequest} from "@/types/api";
import {useAuth} from "@/context/AuthContext";
import {useRoute} from "@react-navigation/core";

const MomoPaymentScreen = () => {
    const { colors, isDark } = useTheme()
    const router = useRouter()
    const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
    const [countdown, setCountdown] = useState(300) // 5 minutes in seconds
    const [transactionId, setTransactionId] = useState<string>("")
    const { userId } = useAuth()
    const route = useRoute()

    const { amount } = route.params || {}
    if (!amount) {
        Alert.alert('Lỗi', 'Không có thông tin gói đăng ký');
        return null;
    }

    const [createPaymentIntent] = useCreatePaymentIntentMutation()

    const initiatePayment = async () => {
        try {

            const paymentRequest : PaymentRequest = {
                paymentMethod: "momo",
                amount: Number(amount) * 25000,
                currency: "vnd",
                userId: userId as string
            }

            const response = await createPaymentIntent(paymentRequest).unwrap()

            console.log("CMM: " + response)

            const data = response.data;

            console.log("Payment Intent: ", data)

            if (data.paymentUrl) {
                const result = await WebBrowser.openBrowserAsync(data.paymentUrl)
                setTransactionId(data.transactionId as string)
                handlePaymentResult(result.type)
            }
        } catch (error) {
            setPaymentStatus("failed")
        }
    }

    const handlePaymentResult = (resultType: WebBrowser.WebBrowserResultType) => {
        if (resultType === "success") {
            // Kiểm tra trạng thái giao dịch
            checkPaymentStatus()
        } else {
            setPaymentStatus("failed")
        }
    }

    const checkPaymentStatus = async () => {
        try {
            const {data: statusResponse} = useGetTransactionStatusQuery(transactionId)
            const status = statusResponse?.data

            setPaymentStatus(status === "Success" ? "success" : "failed")
        } catch (error) {
            setPaymentStatus("failed")
        }
    }

    // Simulate payment process
    useEffect(() => {
        initiatePayment()
    }, [])

    // Countdown timer
    useEffect(() => {
        if (paymentStatus === "pending" && countdown > 0) {
            const interval = setInterval(() => {
                setCountdown((prev) => prev - 1)
            }, 1000)

            return () => clearInterval(interval)
        }

        if (countdown === 0 && paymentStatus === "pending") {
            setPaymentStatus("failed")
        }
    }, [countdown, paymentStatus])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`
    }

    const handleDone = () => {
        if (paymentStatus === "success") {
            // In a real app, you would update the user's subscription status here
            router.push("/(tabs)")
        } else {
            router.back()
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>MoMo Payment</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                {/* MoMo Logo */}
                <View style={[styles.logoContainer, { backgroundColor: colors.card }]}>
                    <Image source={{ uri: "/placeholder.svg?height=100&width=100" }} style={styles.logo} />
                </View>

                {/* Payment Status */}
                <View style={styles.statusContainer}>
                    {paymentStatus === "pending" && (
                        <>
                            <ActivityIndicator size="large" color="#FF6B9B" style={styles.loader} />
                            <Text style={[styles.statusTitle, { color: colors.text }]}>Payment Processing</Text>
                            <Text style={[styles.statusDescription, { color: colors.secondary }]}>
                                Please complete the payment in your MoMo app
                            </Text>
                            <View style={[styles.countdownContainer, { backgroundColor: colors.card }]}>
                                <Text style={[styles.countdownText, { color: colors.text }]}>
                                    Time remaining: {formatTime(countdown)}
                                </Text>
                            </View>
                        </>
                    )}

                    {paymentStatus === "success" && (
                        <>
                            <View style={styles.successIcon}>
                                <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                            </View>
                            <Text style={[styles.statusTitle, { color: colors.text }]}>Payment Successful</Text>
                            <Text style={[styles.statusDescription, { color: colors.secondary }]}>
                                Your premium subscription is now active
                            </Text>
                        </>
                    )}

                    {paymentStatus === "failed" && (
                        <>
                            <View style={styles.failedIcon}>
                                <Ionicons name="close-circle" size={80} color="#F44336" />
                            </View>
                            <Text style={[styles.statusTitle, { color: colors.text }]}>Payment Failed</Text>
                            <Text style={[styles.statusDescription, { color: colors.secondary }]}>
                                We couldn't process your payment. Please try again.
                            </Text>
                        </>
                    )}
                </View>

                {/* Payment Details */}
                {(paymentStatus === "success" || paymentStatus === "failed") && (
                    <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.secondary }]}>Plan</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>Premium Monthly</Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.secondary }]}>Amount</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>${amount}</Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.secondary }]}>Payment Method</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>MoMo</Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: colors.secondary }]}>Date</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{new Date().toLocaleDateString()}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Action Button */}
            {(paymentStatus === "success" || paymentStatus === "failed") && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleDone}>
                        <LinearGradient
                            colors={["#FF6B9B", "#FF8E53"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.actionButtonText}>
                                {paymentStatus === "success" ? "Start Listening" : "Try Again"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: Platform.OS === "ios" ? 50 : 30,
        paddingBottom: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
    },
    logo: {
        width: 80,
        height: 80,
    },
    statusContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    loader: {
        marginBottom: 20,
    },
    successIcon: {
        marginBottom: 20,
    },
    failedIcon: {
        marginBottom: 20,
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    statusDescription: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    countdownContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    countdownText: {
        fontSize: 16,
        fontWeight: "500",
    },
    detailsContainer: {
        width: "100%",
        borderRadius: 12,
        padding: 16,
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
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 20,
    },
    actionButton: {
        borderRadius: 30,
        overflow: "hidden",
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: "center",
        borderRadius: 30,
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
})

export default MomoPaymentScreen