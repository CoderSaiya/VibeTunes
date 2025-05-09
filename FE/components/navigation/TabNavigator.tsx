import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import HomeScreen from "@/app/(tabs)";
import LibraryScreen from "@/app/(tabs)/library";
import SearchScreen from "@/app/(tabs)/search";
import RoomsScreen from "@/app/(tabs)/room";
import ProfileScreen from "@/app/(tabs)/profile";
import AnimatedTabBar from "@/components/navigation/AnimatedTabBar";

const Tab = createBottomTabNavigator()

const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <AnimatedTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: "absolute",
                    height: 60,
                    zIndex: 1000,
                },
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Library" component={LibraryScreen} />
            <Tab.Screen name="Rooms" component={RoomsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    )
}

export default TabNavigator;