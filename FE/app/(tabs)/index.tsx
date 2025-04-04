import {ScrollView, Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import {StatusBar} from "expo-status-bar";
import {useTheme} from "@/context/ThemeContext";
import {Ionicons} from "@expo/vector-icons";
import {usePlayerStore} from "@/store/playerStore";
import ArtistSection from "@/components/home/ArtistSection";
import LatestSection from "@/components/home/LatestSection";
import Carousel from "@/components/home/Carousel";
import MiniPlayer from "@/components/home/MiniPlayer";

// Mock data for development
const artistsData = [
    {
        id: "1",
        name: "Guru Randhawa",
        image: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482553Xrb/anh-mo-ta.png",
    },
    {
        id: "2",
        name: "Justin Bieber",
        image: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482553Xrb/anh-mo-ta.png",
    },
    {
        id: "3",
        name: "Arijit Singh",
        image: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482553Xrb/anh-mo-ta.png",
    },
    {
        id: "4",
        name: "Taylor Swift",
        image: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482553Xrb/anh-mo-ta.png",
    },
]

const carouselData = [
    {
        id: "1",
        title: "Behri Duniya Mp3 Song",
        subtitle: "21 Songs",
        image: "https://via.placeholder.com/400x200",
    },
    {
        id: "2",
        title: "Top Hits 2023",
        subtitle: "15 Songs",
        image: "https://via.placeholder.com/400x200",
    },
    {
        id: "3",
        title: "Chill Vibes",
        subtitle: "18 Songs",
        image: "https://via.placeholder.com/400x200",
    },
]

const latestData = [
    {
        id: "1",
        title: "Song 1",
        artist: "Artist 1",
        image: "https://via.placeholder.com/150",
    },
    {
        id: "2",
        title: "Song 2",
        artist: "Artist 2",
        image: "https://via.placeholder.com/150",
    },
    {
        id: "3",
        title: "Song 3",
        artist: "Artist 3",
        image: "https://via.placeholder.com/150",
    },
    {
        id: "4",
        title: "Song 4",
        artist: "Artist 4",
        image: "https://via.placeholder.com/150",
    },
]

export default function HomeScreen() {
    const { colors, toggleTheme, isDark } = useTheme()
    const { setCurrentSong } = usePlayerStore()

    const handleArtistPress = (artist: any) => {
        console.log("Artist pressed:", artist)
        // Navigate to artist details
    }

    const handleSeeAllPress = (section: string) => {
        console.log("See all pressed for section:", section)
        // Navigate to section list
    }

    const handleCarouselItemPress = (item: any) => {
        console.log("Carousel item pressed:", item)
        // Handle carousel item press
    }

    const handleSongPress = (song: any) => {
        console.log("Song pressed:", song)
        setCurrentSong({
            id: song.id,
            title: song.title,
            artist: song.artist,
            cover: song.image,
            audio: "https://example.com/audio.mp3", // This would be the actual audio URL
        })
    }
  return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
          <StatusBar style={isDark ? 'light' : 'dark'} />

          <View style={styles.header}>
              <TouchableOpacity style={styles.menuButton}>
                  <Ionicons name="menu" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Home</Text>
              <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
                  <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={colors.text} />
              </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <Carousel data={carouselData} onItemPress={handleCarouselItemPress} />

              <ArtistSection
                  title="Artist"
                  data={artistsData}
                  onSeeAllPress={() => handleSeeAllPress("artists")}
                  onArtistPress={handleArtistPress}
              />

              <LatestSection
                  title="Latest"
                  data={latestData}
                  onSeeAllPress={() => handleSeeAllPress("latest")}
                  onSongPress={handleSongPress}
              />
          </ScrollView>

          <MiniPlayer />
      </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
    },
    menuButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: "bold",
        marginLeft: 15,
    },
    themeButton: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 100, // Space for mini player
    },
});
