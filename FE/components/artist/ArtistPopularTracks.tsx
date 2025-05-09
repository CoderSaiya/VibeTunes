import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { MoreVertical, Play } from "lucide-react-native"
import {useTheme} from "@/context/ThemeContext";
import {Song} from "@/types/song";

interface ArtistPopularTracksProps {
    tracks: Song[]
}

const ArtistPopularTracks: React.FC<ArtistPopularTracksProps> = ({ tracks }) => {
    const { colors } = useTheme()

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular</Text>

            {tracks.map((track, index) => (
                <TouchableOpacity
                    key={track.id}
                    style={[
                        styles.trackItem,
                        { borderBottomColor: colors.border }
                    ]}
                >
                    <Text style={[styles.trackNumber, { color: colors.secondary }]}>{index + 1}</Text>

                    <Image source={{ uri: track.coverImgUrl }} style={styles.trackImage} />

                    <View style={styles.trackInfo}>
                        <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={1}>
                            {track.title}
                        </Text>
                        <Text style={[styles.trackPlays, { color: colors.secondary }]}>
                            {track.streams} plays
                        </Text>
                    </View>

                    <Text style={[styles.trackDuration, { color: colors.secondary }]}>
                        {track.duration}
                    </Text>

                    <TouchableOpacity style={styles.moreButton}>
                        <MoreVertical size={20} color={colors.secondary} />
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={[styles.seeAllButton, { borderColor: colors.border }]}>
                <Text style={[styles.seeAllText, { color: colors.text }]}>See All</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 0.5,
    },
    trackNumber: {
        width: 25,
        fontSize: 16,
        textAlign: 'center',
    },
    trackImage: {
        width: 45,
        height: 45,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    trackInfo: {
        flex: 1,
    },
    trackTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    trackPlays: {
        fontSize: 13,
    },
    trackDuration: {
        fontSize: 14,
        marginRight: 10,
    },
    moreButton: {
        padding: 5,
    },
    seeAllButton: {
        marginTop: 15,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 16,
        fontWeight: '500',
    },
})

export default ArtistPopularTracks