import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

interface PremiumBannerProps {
    onPress: () => void
}

const PremiumBanner: React.FC<PremiumBannerProps> = ({ onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <LinearGradient
                colors={["#FF6B9B", "#FF8E53"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="star" size={24} color="#FFFFFF" />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Upgrade to Premium</Text>
                        <Text style={styles.subtitle}>Ad-free music, offline listening, and more</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 20,
        borderRadius: 12,
        overflow: "hidden",
    },
    gradient: {
        borderRadius: 12,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
    },
    subtitle: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 12,
    },
})

export default PremiumBanner