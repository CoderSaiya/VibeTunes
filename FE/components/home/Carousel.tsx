"use client"

import React, {memo} from "react"
import {useState, useRef, useEffect} from "react"
import {View, Text as RNText, StyleSheet, FlatList, Image, Dimensions, TouchableOpacity, Animated} from "react-native"
import {Ionicons} from "@expo/vector-icons"
import {useTheme} from "@/context/ThemeContext"
import {Playlist} from "@/types/playlist";

// Rename Text to avoid conflicts
const Text = RNText

const {width} = Dimensions.get("window")
const ITEM_WIDTH = width - 40

interface AnimatedFlatListProps {
    renderItem?: ({item}: { item: Playlist }) => React.JSX.Element
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

interface CarouselProps {
    data: Playlist[]
    onItemPress: (item: Playlist) => void
}

const CarouselItem = memo(({item, onPress}: { item: Playlist; onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress} activeOpacity={0.9}>
            <Image source={{uri: item.coverImageUrl}} style={styles.image}/>
            <View style={styles.overlay}>
                <Text style={styles.title}>{item.name}</Text>
                <View style={styles.subtitleContainer}>
                    <Ionicons name="musical-notes" size={16} color="#FFFFFF"/>
                    <Text style={styles.subtitle}>{item.songsList?.length ?? 0} Songs</Text>
                </View>
                <TouchableOpacity style={styles.arrowButton}>
                    <Ionicons name="arrow-forward" size={24} color="#FFFFFF"/>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
})

CarouselItem.displayName = 'CarouselItem'

const Carousel: React.FC<CarouselProps> = ({data, onItemPress}) => {
    if (!data?.length) return null;

    const {colors} = useTheme()
    const [activeIndex, setActiveIndex] = useState(0)
    const flatListRef = useRef<FlatList>(null)
    const scrollX = useRef(new Animated.Value(0)).current

    const handleItemPress = useRef((item: Playlist) => {
        onItemPress(item)
    }).current

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;

        // Only set up auto-scrolling if we have more than one item
        if (data.length > 1) {
            intervalId = setInterval(() => {
                const nextIndex = activeIndex === data.length - 1 ? 0 : activeIndex + 1;

                if (flatListRef.current) {
                    flatListRef.current.scrollToIndex({
                        index: nextIndex,
                        animated: true,
                    })
                }
            }, 3000)
        }

        return () => {
            if (intervalId) clearInterval(intervalId)
        }
    }, [activeIndex, data.length])

    const renderItem = ({item}: { item: Playlist }) => {
        return (
            <CarouselItem
                item={item}
                onPress={() => handleItemPress(item)}
            />
        )
    }

    const getItemLayout = (_: any, index: number) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
    })

    const handleScroll = Animated.event(
        [{nativeEvent: {contentOffset: {x: scrollX}}}],
        {useNativeDriver: true}
    )

    const handleMomentumScrollEnd = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH)
        setActiveIndex(index)
    }

    const onScrollToIndexFailed = (info: {
        index: number;
        highestMeasuredFrameIndex: number;
        averageItemLength: number;
    }) => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {
            if (flatListRef.current) {
                flatListRef.current.scrollToIndex({
                    index: info.index,
                    animated: true
                });
            }
        });
    }

    return (
        <View style={styles.container}>
            <AnimatedFlatList
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
                getItemLayout={getItemLayout}
                onScrollToIndexFailed={onScrollToIndexFailed}
                removeClippedSubviews={true}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                windowSize={3}
            />
            {data.length > 1 && (
                <View style={styles.indicatorContainer}>
                    {data.map((_, index) => (
                        <View
                            key={`indicator-${index}`}
                            style={[
                                styles.indicator,
                                { backgroundColor: index === activeIndex ? "#FFD700" : "#FFFFFF" }
                            ]}
                        />
                    ))}
                </View>
            )}
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