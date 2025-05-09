import type React from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native"
import { useTheme } from "@/context/ThemeContext"
import {Album} from "@/types/album";

interface ArtistAlbumsProps {
    albums: Album[]
}

const ArtistAlbums: React.FC<ArtistAlbumsProps> = ({ albums }) => {
    const { colors } = useTheme()

    const renderAlbumItem = ({ item }: { item: Album }) => (
        <TouchableOpacity style={styles.albumItem}>
            <Image source={{ uri: item.coverImgUrl }} style={styles.albumImage} />
            <Text style={[styles.albumTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
            </Text>
            <Text style={[styles.albumInfo, { color: colors.secondary }]}>
                {item.releaseDate} • {item.songsList.length} tracks
            </Text>
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Albums</Text>
                <TouchableOpacity>
                    <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={albums}
                renderItem={renderAlbumItem}
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
    albumItem: {
        width: 150,
        marginHorizontal: 5,
    },
    albumImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
    },
    albumTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    albumInfo: {
        fontSize: 14,
    },
})

export default ArtistAlbums