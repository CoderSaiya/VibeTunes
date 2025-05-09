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
import {useGoogleLoginMutation, useLoginMutation} from "@/store/api"
import {useAuth} from "@/context/AuthContext";
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const webClientId = '168725755219-su1sltosrggkoeih5lduclo8j68asbub.apps.googleusercontent.com';
const androidClientId = '168725755219-qd46l03sal01dmrlpkl7jveibi0n9iqf.apps.googleusercontent.com';

const config = {
    webClientId: webClientId,
    androidClientId: androidClientId,
}

const { width, height } = Dimensions.get("window")

export default function LoginScreen() {
    const { colors, isDark } = useTheme()
    const router = useRouter()
    const [login, { isLoading }] = useLoginMutation()
    const [loginGoogle, { isLoading: googleLoading }] = useGoogleLoginMutation();

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(50)).current

    const {login: loginContext} = useAuth();

    const [request, response, promptAsync] = Google.useAuthRequest(config)

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

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication !== null)
                handleGoogleToken(authentication.idToken as string);
        }
    }, [response]);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter both email and password")
            return
        }

        try {
            const result = await login({ email, password }).unwrap()
            // Navigate to main app after successful login
            const data = result.data;
            loginContext(data.accessToken, data.refreshToken);
            router.replace("/(tabs)")
        } catch (error) {
            Alert.alert("Login Failed", error?.toString() || "Please check your credentials and try again")
        }
    }

    const signInWithGoogle = async () => {
        try {
            await promptAsync();
        } catch (error) {
            console.error('Google SignIn error', error);
        }
    };

    const handleGoogleToken = async (idToken: string) => {
        try {
            // Call your backend API with the idToken
            const resp = await loginGoogle({idToken: idToken}).unwrap();
            if (resp.isSuccess) {
                const data = resp.data;
                console.log('JWT:', data.accessToken, "Refresh: ", data.refreshToken);
                loginContext(data.accessToken, data.refreshToken);
                router.replace("/(tabs)")
            } else {
                console.error('Login error:', resp);
                Alert.alert("Login Failed", "Failed to authenticate with the server.");
            }
        } catch (error) {
            console.error('Backend authentication error:', error);
            Alert.alert("Login Failed", error?.toString() || "Authentication failed");
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
                        <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)")}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>

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
                            <Text style={[styles.tagline, { color: colors.text }]}>Listen together, vibe together</Text>
                        </View>

                        <Text style={[styles.title, { color: colors.text }]}>Login</Text>

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

                            <TouchableOpacity style={styles.forgotPassword}>
                                <Link href="/auth/forgot-password" asChild>
                                    <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Forgot Password?</Text>
                                </Link>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, isLoading && styles.disabledButton]}
                                onPress={handleLogin}
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
                                        <Text style={styles.loginButtonText}>Login</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.divider}>
                                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                                <Text style={[styles.dividerText, { color: colors.text }]}>OR</Text>
                                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                            </View>

                            <View style={styles.socialButtons}>
                                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? "#333" : "#f1f1f1" }]} onPress={signInWithGoogle} disabled={!request}>
                                    <Ionicons name="logo-google" size={20} color={isDark ? "#fff" : "#DB4437"} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? "#333" : "#f1f1f1" }]}>
                                    <Ionicons name="logo-apple" size={20} color={isDark ? "#fff" : "#000"} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDark ? "#333" : "#f1f1f1" }]}>
                                    <Ionicons name="logo-facebook" size={20} color={isDark ? "#fff" : "#4267B2"} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.signupContainer}>
                                <Text style={[styles.signupText, { color: colors.text }]}>Don't have an account?</Text>
                                <Link href="/auth/register" asChild>
                                    <TouchableOpacity>
                                        <Text style={[styles.signupLink, { color: colors.primary }]}>{" Sign Up"}</Text>
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
    backButton: {
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 30,
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
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 20,
    },
    forgotPasswordText: {
        fontSize: 14,
    },
    loginButton: {
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
    loginButtonText: {
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
    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    signupText: {
        fontSize: 14,
    },
    signupLink: {
        fontSize: 14,
        fontWeight: "bold",
    },
})