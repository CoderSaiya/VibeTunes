import React from "react";
import {Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SongItemProps} from "@/types";

const { width } = Dimensions.get("window");
const itemWidth = (width / 3) * 2;
const offset = itemWidth;

const SongItem: React.FC<SongItemProps> = ({ item, scrollX, index, onPress }) => {
    const scale = scrollX.interpolate({
        inputRange: [-offset + index * offset, index * offset, offset + index * offset],
        outputRange: [0.85, 1, 0.85],
        extrapolate: "clamp",
    });

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={() => onPress && onPress(item)}>
            <Animated.View
                style={[
                    styles.itemContainer,
                    {
                        width: itemWidth,
                        transform: [{ scale }],
                    },
                ]}
            >
                <View style={styles.songCard}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: item.coverImgUrl }} style={styles.image} />

                        {/* Large number overlay */}
                        <Text style={styles.numberOverlay}>{index + 1}</Text>

                        {/*/!* Tag if present *!/*/}
                        {/*{item.tag ? (*/}
                        {/*    <View style={[styles.tag, { backgroundColor: item.tagColor }]}>*/}
                        {/*        <Text style={styles.tagText}>{item.tag}</Text>*/}
                        {/*    </View>*/}
                        {/*) : null}*/}
                    </View>

                    <View style={styles.songInfo}>
                        <Text style={styles.title} numberOfLines={2}>
                            {item.title} - {item.artist}
                        </Text>
                        <Text style={styles.price}>{item.streams} Streams</Text>
                        <Text style={styles.sold}>{}</Text>
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        marginHorizontal: 8,
    },
    songCard: {
        backgroundColor: "#1F2937",
        borderRadius: 12,
        overflow: "hidden",
        height: itemWidth * 1.4,
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: itemWidth,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    numberOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        fontSize: 120,
        fontWeight: "bold",
        color: "rgba(255, 255, 255, 0.8)",
        lineHeight: 120,
    },
    tag: {
        position: "absolute",
        top: 12,
        right: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    tagText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    songInfo: {
        padding: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 8,
    },
    price: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#EF4444",
        marginBottom: 4,
    },
    sold: {
        fontSize: 14,
        color: "#9CA3AF",
    },
});

export default SongItem;