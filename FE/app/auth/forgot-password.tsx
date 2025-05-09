import { useState, useRef, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "@/context/ThemeContext"
import Background from "@/components/auth/Background"
import {
    useForgotPasswordMutation,
    useVerifyCodeMutation,
    useResetPasswordMutation,
} from "@/store/api"

export default function ForgotPasswordScreen() {
    const { colors, isDark } = useTheme()
    const router = useRouter()

    // API hooks
    const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation()
    const [verifyCode, { isLoading: isVerifying }] = useVerifyCodeMutation()
    const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()

    // State for multi-step flow
    const [step, setStep] = useState(1) // 1: email, 2: code, 3: new password
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(50)).current

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start()
    }, [])

    const loading = isSending || isVerifying || isResetting

    const handleSubmit = async () => {
        try {
            if (step === 1) {
                if (!email.trim()) {
                    Alert.alert("Error", "Please enter your email address")
                    return
                }
                await forgotPassword({ email }).unwrap()
                setStep(2)
            } else if (step === 2) {
                if (!code.trim() || code.length !== 6) {
                    Alert.alert("Error", "Please enter the 6-digit code sent to your email.")
                    return
                }
                await verifyCode({ email, code }).unwrap()
                setStep(3)
            } else if (step === 3) {
                if (!password || password !== confirmPassword) {
                    Alert.alert("Error", "Passwords do not match or are empty.")
                    return
                }
                await resetPassword({ email, password }).unwrap()
                Alert.alert("Success", "Your password has been reset.", [
                    { text: "OK", onPress: () => router.replace("/auth/login") }
                ])
            }
        } catch (error : any) {
            Alert.alert("Error", error.message || error || "Something went wrong. Please try again.")
        }
    }

    // UI helpers
    const getTitle = () => {
        if (step === 1) return "Forgot Password"
        if (step === 2) return "Verify Code"
        return "Reset Password"
    }

    const getDescription = () => {
        if (step === 1)
            return "Enter your email address and we'll send you instructions to reset your password."
        if (step === 2)
            return "Enter the 6-digit code sent to your email address."
        return "Enter your new password below and confirm it."
    }

    const getIcon = () => {
        if (step === 1) return "lock-open"
        if (step === 2) return "key"
        return "lock-closed"
    }

    const getButtonText = () => {
        if (step === 1) return "Send Reset Link"
        if (step === 2) return "Verify Code"
        return "Reset Password"
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Animated.View
                        style={[
                            styles.formContainer,
                            {
                                backgroundColor: isDark ? "rgba(18, 18, 18, 0.8)" : "rgba(255, 255, 255, 0.8)",
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>

                        <View style={styles.logoContainer}>
                            <LinearGradient
                                colors={["#FF6B9B", "#FF3B30"]}
                                style={styles.logoBackground}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name={getIcon()} size={40} color="#FFFFFF" />
                            </LinearGradient>
                        </View>

                        <Text style={[styles.title, { color: colors.text }]}>{getTitle()}</Text>
                        <Text style={[styles.description, { color: colors.text }]}>{getDescription()}</Text>

                        {step === 1 && (
                            <View style={styles.inputContainer}>
                                <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                    <Ionicons name="mail-outline" size={20} color={colors.text} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Email"
                                        placeholderTextColor={colors.text + "80"}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>
                        )}

                        {step === 2 && (
                            <View style={styles.inputContainer}>
                                <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                    <Ionicons name="key-outline" size={20} color={colors.text} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="6-digit Code"
                                        placeholderTextColor={colors.text + "80"}
                                        value={code}
                                        onChangeText={setCode}
                                        keyboardType="numeric"
                                        maxLength={6}
                                    />
                                </View>
                            </View>
                        )}

                        {step === 3 && (
                            <View style={styles.inputContainer}>
                                <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="New Password"
                                        placeholderTextColor={colors.text + "80"}
                                        secureTextEntry
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                </View>
                                <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Confirm Password"
                                        placeholderTextColor={colors.text + "80"}
                                        secureTextEntry
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={["#FF6B9B", "#FF3B30"]}
                                style={styles.gradientButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>{getButtonText()}</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    formContainer: {
        borderRadius: 20,
        padding: 20,
        width: "100%",
        maxWidth: 400,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 30,
        marginTop: 20,
    },
    logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    description: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 20,
    },
    inputContainer: {
        width: "100%",
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 15,
        height: 55,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: "100%",
        fontSize: 16,
    },
    submitButton: {
        height: 55,
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 10,
    },
    gradientButton: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    disabledButton: {
        opacity: 0.7,
    },
})