"use client"

import { useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ImageBackground } from "react-native"
import { Link } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"

const { width, height } = Dimensions.get("window")

export default function AuthWelcomeScreen() {
    const { colors, isDark } = useTheme()

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(50)).current
    const logoAnim = useRef(new Animated.Value(0.8)).current

    useEffect(() => {
        // Start animations
        Animated.sequence([
            // Logo animation
            Animated.timing(logoAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            // Content animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ]).start()
    }, [])

    return (
        <ImageBackground source={require("@/assets/images/favicon.png")} style={styles.background} resizeMode="cover">
            <StatusBar style="light" />

            <LinearGradient colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]} style={styles.overlay}>
                <View style={styles.container}>
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                transform: [{ scale: logoAnim }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={["#FF6B9B", "#FF3B30"]}
                            style={styles.logoBackground}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="musical-notes" size={50} color="#FFFFFF" />
                        </LinearGradient>
                        <Text style={styles.appName}>Music Room</Text>
                        <Text style={styles.tagline}>Listen together, vibe together</Text>
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.contentContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Text style={styles.welcomeText}>Join the community of music lovers</Text>

                        <View style={styles.buttonContainer}>
                            <Link href="/auth/login" asChild>
                                <TouchableOpacity style={styles.loginButton}>
                                    <LinearGradient
                                        colors={["#FF6B9B", "#FF3B30"]}
                                        style={styles.gradientButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={styles.buttonText}>Login</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Link>

                            <Link href="./auth/register" asChild>
                                <TouchableOpacity style={styles.registerButton}>
                                    <Text style={styles.registerButtonText}>Create Account</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>

                        <View style={styles.socialContainer}>
                            <Text style={styles.socialText}>Or continue with</Text>

                            <View style={styles.socialButtons}>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Ionicons name="logo-google" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.socialButton}>
                                    <Ionicons name="logo-facebook" size={24} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={styles.termsText}>
                            By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </Animated.View>
                </View>
            </LinearGradient>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 60,
    },
    logoContainer: {
        alignItems: "center",
        marginTop: 40,
    },
    logoBackground: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    appName: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 5,
    },
    tagline: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
    },
    contentContainer: {
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 30,
        marginTop: "auto",
    },
    welcomeText: {
        fontSize: 20,
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 30,
    },
    buttonContainer: {
        width: "100%",
        marginBottom: 30,
    },
    loginButton: {
        height: 55,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 15,
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
    registerButton: {
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    registerButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    socialContainer: {
        width: "100%",
        alignItems: "center",
        marginBottom: 30,
    },
    socialText: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
        marginBottom: 15,
    },
    socialButtons: {
        flexDirection: "row",
        justifyContent: "center",
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 10,
    },
    termsText: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 12,
        textAlign: "center",
        paddingHorizontal: 20,
    },
    termsLink: {
        color: "#FFFFFF",
        textDecorationLine: "underline",
    },
})