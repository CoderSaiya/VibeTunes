"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"

const StripePaymentScreen = () => {
    const { colors, isDark } = useTheme()
    const router = useRouter()

    // Form state
    const [cardNumber, setCardNumber] = useState("")
    const [cardName, setCardName] = useState("")
    const [expiryDate, setExpiryDate] = useState("")
    const [cvv, setCvv] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    // Form validation
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!cardNumber.trim()) {
            newErrors.cardNumber = "Card number is required"
        } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
            newErrors.cardNumber = "Invalid card number"
        }

        if (!cardName.trim()) {
            newErrors.cardName = "Name on card is required"
        }

        if (!expiryDate.trim()) {
            newErrors.expiryDate = "Expiry date is required"
        } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            newErrors.expiryDate = "Invalid format (MM/YY)"
        }

        if (!cvv.trim()) {
            newErrors.cvv = "CVV is required"
        } else if (!/^\d{3,4}$/.test(cvv)) {
            newErrors.cvv = "Invalid CVV"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\s/g, "")
        const groups = []

        for (let i = 0; i < cleaned.length; i += 4) {
            groups.push(cleaned.substring(i, i + 4))
        }

        return groups.join(" ")
    }

    const handleCardNumberChange = (text: string) => {
        const formatted = formatCardNumber(text.replace(/[^\d]/g, ""))
        setCardNumber(formatted)
    }

    const handleExpiryDateChange = (text: string) => {
        let formatted = text.replace(/[^\d]/g, "")

        if (formatted.length > 2) {
            formatted = `${formatted.substring(0, 2)}/${formatted.substring(2, 4)}`
        }

        setExpiryDate(formatted)
    }

    const handlePayment = async () => {
        if (!validateForm()) return

        setIsProcessing(true)

        // In a real app, you would integrate with Stripe API here
        setTimeout(() => {
            setIsProcessing(false)
            router.push("/(payment)/success")
        }, 2000)
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar style={isDark ? "light" : "dark"} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Credit Card Payment</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Payment Summary */}
                <View style={[styles.summaryContainer, { backgroundColor: colors.card }]}>
                    <Text style={[styles.summaryTitle, { color: colors.text }]}>Premium Monthly</Text>
                    <Text style={[styles.summaryPrice, { color: colors.primary }]}>$9.99/month</Text>
                    <Text style={[styles.summaryDescription, { color: colors.secondary }]}>
                        Unlimited ad-free music, offline listening, and high-quality audio
                    </Text>
                </View>

                {/* Card Form */}
                <View style={styles.formContainer}>
                    <Text style={[styles.formTitle, { color: colors.text }]}>Card Details</Text>

                    {/* Card Number */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Card Number</Text>
                        <View
                            style={[
                                styles.inputContainer,
                                { backgroundColor: colors.card, borderColor: errors.cardNumber ? "#F44336" : colors.border },
                            ]}
                        >
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="1234 5678 9012 3456"
                                placeholderTextColor={colors.secondary}
                                value={cardNumber}
                                onChangeText={handleCardNumberChange}
                                keyboardType="number-pad"
                                maxLength={19}
                            />
                            <Ionicons name="card-outline" size={20} color={colors.secondary} />
                        </View>
                        {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
                    </View>

                    {/* Name on Card */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Name on Card</Text>
                        <View
                            style={[
                                styles.inputContainer,
                                { backgroundColor: colors.card, borderColor: errors.cardName ? "#F44336" : colors.border },
                            ]}
                        >
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="John Doe"
                                placeholderTextColor={colors.secondary}
                                value={cardName}
                                onChangeText={setCardName}
                            />
                        </View>
                        {errors.cardName && <Text style={styles.errorText}>{errors.cardName}</Text>}
                    </View>

                    {/* Expiry Date and CVV */}
                    <View style={styles.rowInputs}>
                        {/* Expiry Date */}
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>Expiry Date</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    { backgroundColor: colors.card, borderColor: errors.expiryDate ? "#F44336" : colors.border },
                                ]}
                            >
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="MM/YY"
                                    placeholderTextColor={colors.secondary}
                                    value={expiryDate}
                                    onChangeText={handleExpiryDateChange}
                                    keyboardType="number-pad"
                                    maxLength={5}
                                />
                            </View>
                            {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
                        </View>

                        {/* CVV */}
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>CVV</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    { backgroundColor: colors.card, borderColor: errors.cvv ? "#F44336" : colors.border },
                                ]}
                            >
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="123"
                                    placeholderTextColor={colors.secondary}
                                    value={cvv}
                                    onChangeText={setCvv}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    secureTextEntry
                                />
                                <TouchableOpacity>
                                    <Ionicons name="help-circle-outline" size={20} color={colors.secondary} />
                                </TouchableOpacity>
                            </View>
                            {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
                        </View>
                    </View>

                    {/* Save Card Option */}
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: colors.card }]}>
                            <Ionicons name="checkmark" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.checkboxLabel, { color: colors.text }]}>Save card for future payments</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Payment Button */}
            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                    style={[styles.payButton, { opacity: isProcessing ? 0.7 : 1 }]}
                    onPress={handlePayment}
                    disabled={isProcessing}
                >
                    <LinearGradient
                        colors={["#FF6B9B", "#FF8E53"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        {isProcessing ? (
                            <View style={styles.processingContainer}>
                                <View style={styles.loadingDot} />
                                <View style={styles.loadingDot} />
                                <View style={styles.loadingDot} />
                            </View>
                        ) : (
                            <Text style={styles.payButtonText}>Pay $9.99</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={[styles.secureText, { color: colors.secondary }]}>
                    <Ionicons name="lock-closed" size={14} color={colors.secondary} /> Secure payment via Stripe
                </Text>
            </View>
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
    },
    summaryContainer: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    summaryPrice: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 8,
    },
    summaryDescription: {
        fontSize: 14,
    },
    formContainer: {
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 50,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    errorText: {
        color: "#F44336",
        fontSize: 12,
        marginTop: 4,
    },
    rowInputs: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    checkboxLabel: {
        fontSize: 14,
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 20,
    },
    payButton: {
        borderRadius: 30,
        overflow: "hidden",
        marginBottom: 12,
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: "center",
        borderRadius: 30,
    },
    payButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    secureText: {
        fontSize: 12,
        textAlign: "center",
    },
    processingContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#FFFFFF",
        margin: 3,
        opacity: 0.7,
    },
})

export default StripePaymentScreen