"use client";

import React, { useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    TouchableOpacity
} from "react-native";
import { SongCarouselSectionProps } from "@/types";
import SongItem from "@/components/home/SongItem";

const { width } = Dimensions.get("window");
const itemWidth = (width / 3) * 2;
const padding = (width - itemWidth) / 2;
const offset = itemWidth;

const HotSongSection: React.FC<SongCarouselSectionProps> = ({
                                                                data,
                                                                title = "Hot Songs",
                                                                onSeeAllPress,
                                                                onArtistPress,
                                                            }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true }
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {onSeeAllPress && (
                    <TouchableOpacity onPress={onSeeAllPress}>
                        <Text style={styles.seeAllText}>Xem tất cả</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Animated.ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
                snapToInterval={offset}
                decelerationRate="fast"
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {data.map((song, index) => (
                    <SongItem key={song.id} item={song} index={index} scrollX={scrollX} onPress={onArtistPress} />
                ))}
            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF',
        paddingVertical: 20,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
    },
    seeAllText: {
        fontSize: 14,
        color: "#3B82F6",
        fontWeight: "600",
    },
    scrollViewContent: {
        paddingHorizontal: padding,
        paddingBottom: 20,
    },
});

export default HotSongSection;
