// "use client"
// import { TouchableOpacity, View } from "react-native"
// import { CurvedBottomBar } from "react-native-curved-bottom-bar"
// import { scale } from "react-native-size-scaling"
// import { Ionicons } from "@expo/vector-icons"
// import HomeScreen from "@/app/(tabs)"
// import LibraryScreen from "@/app/(tabs)/library"
// import RoomsScreen from "@/app/(tabs)/room"
// import ProfileScreen from "@/app/(tabs)/profile"
// import { useTheme } from "@/context/ThemeContext"
// import { usePlayerStore } from "@/store/playerStore"
// import MiniPlayer from "@/components/home/MiniPlayer"
// import SearchScreen from "@/app/(tabs)/search";
//
// const CustomTabBar = () => {
//     const { colors, isDark } = useTheme()
//     const { currentSong } = usePlayerStore()
//
//     // Render icon based on route name and selected state
//     const _renderIcon = (routeName: string, selectedTab: string) => {
//         let icon = ""
//
//         switch (routeName) {
//             case "Home":
//                 icon = "home"
//                 break
//             case "Library":
//                 icon = "library"
//                 break
//             case "Search":
//                 icon = "search"
//                 break
//             case "Rooms":
//                 icon = "people"
//                 break
//             case "Profile":
//                 icon = "person"
//                 break
//         }
//
//         return (
//             <Ionicons
//                 name={icon as any}
//                 size={scale(22)}
//                 color={routeName === selectedTab ? colors.primary : colors.tabBarInactive}
//             />
//         )
//     }
//
//     // Render tab bar item
//     const renderTabBar = ({ routeName, selectedTab, navigate }: any) => {
//         return (
//             <TouchableOpacity
//                 onPress={() => navigate(routeName)}
//                 style={{
//                     flex: 1,
//                     alignItems: "center",
//                     justifyContent: "center",
//                 }}
//             >
//                 {_renderIcon(routeName, selectedTab)}
//             </TouchableOpacity>
//         )
//     }
//
//     // Render center button
//     const renderCircle = ({ selectedTab, navigate }: any) => {
//         return (
//             <View
//                 style={{
//                     width: 60,
//                     height: 60,
//                     borderRadius: 35,
//                     backgroundColor: colors.primary,
//                     justifyContent: "center",
//                     alignItems: "center",
//                     shadowColor: "#000",
//                     shadowOffset: {
//                         width: 0,
//                         height: 2,
//                     },
//                     shadowOpacity: 0.25,
//                     shadowRadius: 3.84,
//                     elevation: 5,
//                 }}
//             >
//                 <TouchableOpacity
//                     style={{
//                         flex: 1,
//                         justifyContent: "center",
//                         alignItems: "center",
//                     }}
//                     onPress={() => navigate("Search")}
//                 >
//                     <Ionicons name="search" color="#FFFFFF" size={scale(26)} />
//                 </TouchableOpacity>
//             </View>
//         )
//     }
//
//     return (
//         <View style={{ flex: 1 }}>
//             <CurvedBottomBar.Navigator
//                 type="UP"
//                 style={{  }}
//                 shadowStyle={{
//                     shadowColor: "#000",
//                     shadowOffset: {
//                         width: 0,
//                         height: 0,
//                     },
//                     shadowOpacity: 0.2,
//                     shadowRadius: 5,
//                 }}
//                 height={60}
//                 circleWidth={60}
//                 bgColor={colors.tabBar}
//                 initialRouteName="Home"
//                 borderTopLeftRight
//                 renderCircle={renderCircle}
//                 tabBar={renderTabBar}
//                 backBehavior="none"
//                 borderColor={colors.border}
//                 borderWidth={0}
//                 screenOptions={{ headerShown: false }}
//             >
//                 <CurvedBottomBar.Screen name="Home" position="LEFT" component={HomeScreen} />
//                 <CurvedBottomBar.Screen name="Library" position="LEFT" component={LibraryScreen} />
//                 <CurvedBottomBar.Screen name="Search" position="MIDDLE" component={SearchScreen} />
//                 <CurvedBottomBar.Screen name="Rooms" component={RoomsScreen} position="RIGHT" />
//                 <CurvedBottomBar.Screen name="Profile" component={ProfileScreen} position="RIGHT" />
//             </CurvedBottomBar.Navigator>
//
//             {/* Render MiniPlayer above the tab bar if a song is playing */}
//             {currentSong && <MiniPlayer />}
//         </View>
//     )
// }
//
// export default CustomTabBar