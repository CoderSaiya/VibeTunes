import React, { useRef, useEffect } from 'react';
import {View, TouchableOpacity, StyleSheet, Dimensions, Animated, type LayoutChangeEvent, Easing} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@/context/ThemeContext";

// Tạo component SVG animated
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const { width } = Dimensions.get("window");
const ANIMATION_DURATION = 300; // Tăng thời lượng để animation mượt hơn
const ANIMATION_EASING = Easing.bezier(0.25, 0.1, 0.25, 1); // Thêm easing để animation tự nhiên hơn
const TAB_BAR_HEIGHT = 65;
const BUBBLE_SIZE = 60; // Tăng kích thước bong bóng
const BUBBLE_RADIUS = BUBBLE_SIZE / 2;

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme()

    // Tính toán chiều rộng của tab
    const tabWidth = width / state.routes.length;

    // Animation values
    const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;
    const scaleX = useRef(new Animated.Value(1)).current;
    const scaleY = useRef(new Animated.Value(1)).current;

    // Tab positions
    const tabPositions = useRef<number[]>([]);

    // Lưu trữ vị trí của tab
    const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
        const { x } = event.nativeEvent.layout;
        tabPositions.current[index] = x;
    };

    // Hiệu ứng chuyển tab
    useEffect(() => {
        const toValue = tabPositions.current[state.index] || state.index * tabWidth;

        // Animation sequence
        Animated.parallel([
            // Translate animation
            Animated.timing(translateX, {
                toValue,
                duration: ANIMATION_DURATION,
                useNativeDriver: true,
                easing: ANIMATION_EASING,
            }),

            // Scale down slightly and then back (squeeze effect)
            Animated.sequence([
                Animated.timing(scaleY, {
                    toValue: 0.8,
                    duration: ANIMATION_DURATION / 3,
                    useNativeDriver: true,
                    easing: ANIMATION_EASING,
                }),
                Animated.timing(scaleY, {
                    toValue: 1,
                    duration: ANIMATION_DURATION / 3,
                    useNativeDriver: true,
                    easing: ANIMATION_EASING,
                }),
            ]),

            // Scale out slightly and then back (bounce effect)
            Animated.sequence([
                Animated.timing(scaleX, {
                    toValue: 1.2,
                    duration: ANIMATION_DURATION / 2,
                    useNativeDriver: true,
                    easing: ANIMATION_EASING,
                }),
                Animated.timing(scaleX, {
                    toValue: 1,
                    duration: ANIMATION_DURATION / 2,
                    useNativeDriver: true,
                    easing: ANIMATION_EASING,
                }),
            ]),
        ]).start();
    }, [state.index, translateX, tabWidth, scaleX, scaleY]);

    // Tạo đường dẫn SVG chính xác cho đường cong
    const getPath = () => {
        const tabWidth = width / state.routes.length;

        // Điều chỉnh tham số đường cong
        const curveHeight = 20; // Độ cao của đường cong
        const curveWidth = tabWidth * 0.6; // Độ rộng của đường cong
        const centerX = tabWidth / 2;

        return `
      M0,0
      L${centerX - curveWidth / 2},0
      C${centerX - curveWidth / 4},0 ${centerX - curveWidth / 4},${-curveHeight} ${centerX},${-curveHeight}
      C${centerX + curveWidth / 4},${-curveHeight} ${centerX + curveWidth / 4},0 ${centerX + curveWidth / 2},0
      L${tabWidth},0
    `;
    };

    // Hàm lấy icon dựa theo index
    const getIcon = (routeName: string, isFocused: boolean) => {
        const color = isFocused ? "#FFFFFF" : colors.tabBarInactive
        const size = 24

        switch (routeName) {
            case "home":
                return <Ionicons name="menu" size={size} color={color} />
            case "library":
                return <MaterialIcons name="layers" size={size} color={color} />
            default:
                return <Ionicons name="home" size={size} color={color} />
        }
    }

    // Màu sắc
    const tabBarBgColor = "#222222"; // Màu nền đen hơi sáng
    const bubbleColor = "#FF6B9B";   // Màu hồng chính xác

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: "transparent",
                    paddingBottom: insets.bottom,
                },
            ]}
        >
            <View style={[styles.tabBar, { backgroundColor: tabBarBgColor }]}>
                {/* Animated Bubble */}
                <Animated.View
                    style={[
                        styles.bubbleContainer,
                        {
                            transform: [
                                { translateX },
                                { scaleX },
                                { scaleY }
                            ],
                            width: tabWidth,
                        },
                    ]}
                >
                    <AnimatedSvg width={tabWidth} height={BUBBLE_SIZE} style={styles.bubbleSvg}>
                        <Path d={getPath()} fill={tabBarBgColor} />
                    </AnimatedSvg>
                    <View style={[styles.bubble, { backgroundColor: bubbleColor }]}>
                        {getIcon(state.routes[state.index].name, true)}
                    </View>
                </Animated.View>

                {/* Tab Buttons */}
                <View style={styles.tabButtonsContainer}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: "tabPress",
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={(options as any).tabBarTestID}
                                onPress={onPress}
                                onLayout={(e) => handleTabLayout(index, e)}
                                style={styles.tabButton}
                            >
                                {!isFocused && getIcon(route.name, isFocused)}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 8, // Thêm shadow cho Android
        shadowColor: "#000", // Shadow cho iOS
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    tabBar: {
        flexDirection: "row",
        height: TAB_BAR_HEIGHT,
        position: "relative",
    },
    tabButtonsContainer: {
        flexDirection: "row",
        width: "100%",
        height: "100%",
    },
    tabButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    bubbleContainer: {
        position: "absolute",
        top: -BUBBLE_SIZE / 2 + 5, // Điều chỉnh vị trí để bong bóng nhô lên
        height: BUBBLE_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    bubbleSvg: {
        position: "absolute",
        bottom: 0,
    },
    bubble: {
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        borderRadius: BUBBLE_RADIUS,
        justifyContent: "center",
        alignItems: "center",
        // Thêm shadow
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
});

export default CustomTabBar;