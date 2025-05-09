"use client";
import { useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
    TextInput,
    NativeScrollEvent,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchHeader from "@/components/search/SearchHeader";
import CategorySection from "@/components/search/CategorySection";
import TrendingSearches from "@/components/search/TrendingSearches";
import SearchResults from "@/components/search/SearchResults";

const headerHeight = 160;
const headerMinHeight = 60;

export default function SearchScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    // Animation value for header. (Make sure not to animate unsupported properties like "width".)
    const animation = useRef(new Animated.Value(1)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [showResults, setShowResults] = useState<boolean>(false);
    // Type the input ref as TextInput or null.
    const inputRef = useRef<TextInput>(null);

    // Use a simple let for tracking scroll and header visibility.
    let scrollValue = 0;
    let headerVisible = true;

    // Handle scroll events with proper typing for the event.
    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event: { nativeEvent: NativeScrollEvent }) => {
                if (isFocused) return;

                const y = event.nativeEvent.contentOffset.y;
                if (y > scrollValue && headerVisible && y > headerHeight / 4) {
                    Animated.spring(animation, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 0,
                    }).start();
                    headerVisible = false;
                }

                if (y < scrollValue && !headerVisible) {
                    Animated.spring(animation, {
                        toValue: 1,
                        useNativeDriver: true,
                        bounciness: 0,
                    }).start();
                    headerVisible = true;
                }

                scrollValue = y;
            },
        }
    );

    // Handle search input focus
    const handleFocus = () => {
        setIsFocused(true);
        Animated.spring(animation, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
        }).start();
        headerVisible = false;
    };

    // Handle search input blur
    const handleBlur = () => {
        setIsFocused(false);
        if (scrollValue <= headerHeight / 4) {
            Animated.spring(animation, {
                toValue: 1,
                useNativeDriver: true,
                bounciness: 0,
            }).start();
            headerVisible = true;
        }
    };

    // Annotate the text parameter as string.
    const handleSearch = (text: string) => {
        setSearchQuery(text);
        setShowResults(text.length > 0);
    };

    // Clear search query and call blur on the input ref.
    const clearSearch = () => {
        setSearchQuery("");
        setShowResults(false);
        inputRef.current?.blur();
    };

    // Annotate the trending search item as string.
    const handleTrendingItemPress = (item: string) => {
        setSearchQuery(item);
        setShowResults(true);
        inputRef.current?.blur();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle={isDark ? "light-content" : "dark-content"}
            />

            {/* Header */}
            <SearchHeader
                animation={animation}
                insets={insets}
                headerHeight={headerHeight}
                headerMinHeight={headerMinHeight}
                searchQuery={searchQuery}
                isFocused={isFocused}
                inputRef={inputRef}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onSearch={handleSearch}
                onClear={clearSearch}
            />

            {/* Content */}
            {showResults ? (
                // Search Results
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingTop: headerMinHeight + insets.top }}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    <SearchResults searchQuery={searchQuery} />
                </ScrollView>
            ) : (
                // Browse Content
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingTop: headerHeight }}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    <CategorySection />
                    <TrendingSearches onTrendingItemPress={handleTrendingItemPress} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        marginBottom: 100
    },
});