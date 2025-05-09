"use client"

import { usePlayerStore } from "@/store/playerStore"
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import TabNavigator from "@/components/navigation/TabNavigator";

const Stack = createNativeStackNavigator()

export default function TabLayout() {
    const { currentSong } = usePlayerStore()

    return (
        <TabNavigator/>
    )
}