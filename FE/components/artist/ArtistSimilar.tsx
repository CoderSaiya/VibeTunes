import type React from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import { useRouter } from "expo-router"

interface Artist {
    id: string
    name: string
    image: string
}

interface ArtistSimilarProps {
    artists: Artist[]
}

const ArtistSimilar: React.FC<ArtistSimilarProps> = ({ artists }) => {
    const { colors } = useTheme()
    const router = useRouter()

    const handleArtistPress = (artist: Artist) => {
        router.push({
            pathname: "/artist-detail",
            params: { id: artist.id, name: artist.name }
        })
    }

    const renderArtistItem = ({ item }: { item: Artist }) => (
        <TouchableOpacity
            style={styles.artistItem}
            onPress={() => handleArtistPress(item)}
        >
            <Image source={{ uri: item.image }} style={styles.artistImage} />
            <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
            </Text>
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Fans Also Like</Text>
                <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={artists}
                renderItem={renderArtistItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    seeAllText: {
        fontSize: 16,
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 15,
    },
    artistItem: {
        width: 100,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    artistImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    artistName: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
})

export default ArtistSimilar