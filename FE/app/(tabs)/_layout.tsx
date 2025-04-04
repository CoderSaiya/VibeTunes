import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import {useTheme} from "@/context/ThemeContext";
import CustomTabBar from "@/components/home/CustomTabBar";

export default function TabLayout() {
    const { colors } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: Platform.select({
                    ios: {
                        // Vị trí absolute để tạo hiệu ứng blur nếu cần
                        position: 'absolute',
                    },
                    default: {},
                }),
            }}
            // Sử dụng custom tab bar đã tạo
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: 'Library',
                }}
            />
        </Tabs>
    );
}
