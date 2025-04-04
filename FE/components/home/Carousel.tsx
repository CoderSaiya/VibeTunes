"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { View, Text as RNText, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/context/ThemeContext"

// Rename Text to avoid conflicts
const Text = RNText

const { width } = Dimensions.get("window")
const ITEM_WIDTH = width - 40

interface CarouselItem {
    id: string
    title: string
    subtitle: string
    image: string
}

interface CarouselProps {
    data: CarouselItem[]
    onItemPress: (item: CarouselItem) => void
}

const Carousel: React.FC<CarouselProps> = ({ data, onItemPress }) => {
    const { colors } = useTheme()
    const [activeIndex, setActiveIndex] = useState(0)
    const flatListRef = useRef<FlatList>(null)
    const scrollX = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const interval = setInterval(() => {
            if (activeIndex === data.length - 1) {
                flatListRef.current?.scrollToIndex({
                    index: 0,
                    animated: true,
                })
            } else {
                flatListRef.current?.scrollToIndex({
                    index: activeIndex + 1,
                    animated: true,
                })
            }
        }, 3000)

        return () => clearInterval(interval)
    }, [activeIndex, data.length])

    const renderItem = ({ item }: { item: CarouselItem }) => {
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => onItemPress(item)} activeOpacity={0.9}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.overlay}>
                    <Text style={styles.title}>{item.title}</Text>
                    <View style={styles.subtitleContainer}>
                        <Ionicons name="musical-notes" size={16} color="#FFFFFF" />
                        <Text style={styles.subtitle}>{item.subtitle}</Text>
                    </View>
                    <TouchableOpacity style={styles.arrowButton}>
                        <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })

    const handleMomentumScrollEnd = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH)
        setActiveIndex(index)
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                snapToInterval={ITEM_WIDTH}
                decelerationRate="fast"
                contentContainerStyle={styles.flatListContent}
            />
            <View style={styles.indicatorContainer}>
                {data.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.indicator, { backgroundColor: index === activeIndex ? "#FFD700" : "#FFFFFF" }]}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    flatListContent: {
        paddingHorizontal: 20,
    },
    itemContainer: {
        width: ITEM_WIDTH,
        height: 200,
        borderRadius: 10,
        overflow: "hidden",
        marginRight: 10,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        padding: 15,
        justifyContent: "flex-end",
    },
    title: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    subtitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    subtitle: {
        color: "#FFFFFF",
        fontSize: 14,
        marginLeft: 5,
    },
    arrowButton: {
        position: "absolute",
        right: 15,
        bottom: 15,
    },
    indicatorContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
})

export default Carousel