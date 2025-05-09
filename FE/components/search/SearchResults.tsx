import type React from "react"
import { View, StyleSheet } from "react-native"
import TracksSection from "./results/TracksSection"
import ArtistsSection from "./results/ArtistsSection"
import AlbumsSection from "./results/AlbumsSection"
import PlaylistsSection from "./results/PlaylistsSection"

interface SearchResultsProps {
    searchQuery: string
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchQuery }) => {
    return (
        <View style={styles.container}>
            <TracksSection searchQuery={searchQuery} />
            <ArtistsSection searchQuery={searchQuery} />
            <AlbumsSection searchQuery={searchQuery} />
            <PlaylistsSection searchQuery={searchQuery} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
    },
})

export default SearchResults