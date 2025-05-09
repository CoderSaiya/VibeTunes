"use client"

import { useState, useRef, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native"
import { Link, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "@/context/ThemeContext"
import { useRegisterMutation } from "@/store/api"

const { width, height } = Dimensions.get("window")

export default function RegisterScreen() {
    const { colors, isDark } = useTheme()
    const router = useRouter()
    const [register, { isLoading }] = useRegisterMutation()

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

    const handleRegister = async () => {
        if (!firstName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert("Error", "Please fill in all fields")
            return
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match")
            return
        }

        try {
            const result = await register({ firstName, lastName, email, password }).unwrap()
            Alert.alert("Registration Successful", "Your account has been created successfully!", [
                { text: "Login Now", onPress: () => router.replace("/auth/login") },
            ])
        } catch (error) {
            Alert.alert("Registration Failed", error?.toString() || "Please try again with different credentials")
        }
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidView}>
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
                        <View style={styles.logoContainer}>
                            <LinearGradient
                                colors={["#FF6B9B", "#FF3B30"]}
                                style={styles.logoBackground}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="musical-notes" size={40} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={[styles.appName, { color: colors.text }]}>VibeTunes</Text>
                            <Text style={[styles.tagline, { color: colors.text }]}>Join the music community</Text>
                        </View>

                        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>

                        <View style={styles.inputContainer}>
                            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                <Ionicons name="person-outline" size={20} color={colors.text} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="First Name"
                                    placeholderTextColor={colors.text + "80"}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </View>

                            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                <Ionicons name="person-outline" size={20} color={colors.text} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Last Name"
                                    placeholderTextColor={colors.text + "80"}
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>

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

                            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Password"
                                    placeholderTextColor={colors.text + "80"}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.inputWrapper, { borderColor: colors.border }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.text} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Confirm Password"
                                    placeholderTextColor={colors.text + "80"}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color={colors.text}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.registerButton, isLoading && styles.disabledButton]}
                                onPress={handleRegister}
                                disabled={isLoading}
                            >
                                <LinearGradient
                                    colors={["#FF6B9B", "#FF3B30"]}
                                    style={styles.gradientButton}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small" />
                                    ) : (
                                        <Text style={styles.registerButtonText}>Create Account</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                <Text style={[styles.dividerText, { color: colors.text }]}>OR</Text>
                                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            </View>

                            <View style={styles.socialButtons}>
                                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? "#333" : "#f1f1f1" }]}>
                                    <Ionicons name="logo-google" size={20} color={isDark ? "#fff" : "#DB4437"} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? "#333" : "#f1f1f1" }]}>
                                    <Ionicons name="logo-apple" size={20} color={isDark ? "#fff" : "#000"} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? "#333" : "#f1f1f1" }]}>
                                    <Ionicons name="logo-facebook" size={20} color={isDark ? "#fff" : "#4267B2"} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.loginContainer}>
                                <Text style={[styles.loginText, { color: colors.text }]}>Already have an account?</Text>
                                <Link href="/auth/login" asChild>
                                    <TouchableOpacity>
                                        <Text style={[styles.loginLink, { color: colors.primary }]}>{" Login"}</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        </View>
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
    logoContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
    },
    appName: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 5,
    },
    tagline: {
        fontSize: 14,
        opacity: 0.8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    inputContainer: {
        width: "100%",
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
    eyeIcon: {
        padding: 5,
    },
    registerButton: {
        height: 55,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 20,
    },
    gradientButton: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    registerButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    disabledButton: {
        opacity: 0.7,
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 14,
    },
    socialButtons: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: "bold",
    },
})