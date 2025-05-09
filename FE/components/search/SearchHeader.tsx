"use client";

import type React from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");
const searchBarHeight = 50;

interface SearchHeaderProps {
    animation: Animated.Value;
    insets: { top: number; bottom: number; left: number; right: number };
    headerHeight: number;
    headerMinHeight: number;
    searchQuery: string;
    isFocused: boolean;
    inputRef: React.RefObject<TextInput>;
    onFocus: () => void;
    onBlur: () => void;
    onSearch: (text: string) => void;
    onClear: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
                                                       animation,
                                                       insets,
                                                       headerHeight,
                                                       headerMinHeight,
                                                       searchQuery,
                                                       isFocused,
                                                       inputRef,
                                                       onFocus,
                                                       onBlur,
                                                       onSearch,
                                                       onClear,
                                                   }) => {
    const { colors } = useTheme();

    // Animation values
    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-(headerHeight - headerMinHeight - insets.top), 0],
    });

    const searchBarTranslateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-(headerHeight - headerMinHeight - searchBarHeight) / 2, 0],
    });

    const titleOpacity = animation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.5, 1],
    });

    const titleScale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
    });

    // Instead of animating width (not supported by native driver), use a static width
    const staticSearchBarWidth = width - 32;

    return (
        <Animated.View
            style={[
                styles.header,
                {
                    backgroundColor: colors.background,
                    paddingTop: insets.top,
                    height: headerHeight,
                    transform: [{ translateY }],
                },
            ]}
        >
            {/* Title */}
            <Animated.View
                style={[
                    styles.titleContainer,
                    {
                        opacity: titleOpacity,
                        transform: [{ scale: titleScale }],
                    },
                ]}
            >
                <Text style={[styles.title, { color: colors.text }]}>Search</Text>
                <Text style={[styles.subtitle, { color: colors.text + "99" }]}>
                    Find your favorite songs, artists, and playlists
                </Text>
            </Animated.View>

            {/* Search Bar */}
            <Animated.View
                style={[
                    styles.searchBarContainer,
                    {
                        transform: [{ translateY: searchBarTranslateY }],
                        width: staticSearchBarWidth,
                    },
                ]}
            >
                <View
                    style={[
                        styles.searchBar,
                        {
                            backgroundColor: colors.card,
                            borderColor: isFocused ? colors.primary : "transparent",
                        },
                    ]}
                >
                    <Ionicons
                        name="search"
                        size={20}
                        color={colors.text + "99"}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        ref={inputRef}
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search for songs, artists, playlists..."
                        placeholderTextColor={colors.text + "80"}
                        value={searchQuery}
                        onChangeText={onSearch}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color={colors.text + "99"}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    header: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingHorizontal: 16,
        justifyContent: "space-between",
        paddingBottom: 16,
    },
    titleContainer: {
        marginTop: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
    },
    searchBarContainer: {
        height: searchBarHeight,
        marginBottom: 8,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: "100%",
        fontSize: 16,
        paddingVertical: 8,
    },
    clearButton: {
        padding: 4,
    },
});

export default SearchHeader;