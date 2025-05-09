import {Animated} from "react-native";
import {Song} from "@/types/song";

// export interface Song {
//     id: string
//     title: string
//     artist: string
//     cover: string
//     audio: string
// }

export type RepeatMode = 'off' | 'all' | 'one'

export interface PlayerState {
    // Song management
    currentSong: Song | null
    queue: Song[]
    setCurrentSong: (song: Song | null) => void
    addToQueue: (song: Song) => void

    // Playback controls
    isPlaying: boolean
    togglePlay: () => void
    nextSong: () => void
    prevSong: () => void

    // Playback state
    progress: number        // 0 to 1
    duration: number        // in seconds
    currentTime: number     // in seconds
    seekTo: (position: number) => void // 0 to 1

    // UI state
    isPlayerScreenVisible: boolean
    setPlayerScreenVisible: (visible: boolean) => void

    // Playback modes
    shuffleMode: boolean
    toggleShuffleMode: () => void
    repeatMode: RepeatMode
    toggleRepeatMode: () => void

    setProgress: (progress: number) => void
    setDuration: (duration: number) => void
    setCurrentTime: (currentTime: number) => void
}

// Hot Song Section
export interface SongItem {
    id: number;
    title: string;
    price: string;
    sold: string;
    image: string;
    tag?: string;
    tagColor?: string;
}

// Category Section
export interface CategoryItem {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
}

export interface SongCarouselSectionProps {
    data: Song[];
    title?: string;
    onSeeAllPress?: () => void;
    onArtistPress?: (item: Song) => void;
}

export interface SongItemProps {
    item: Song;
    index: number;
    scrollX: Animated.Value;
    onPress?: (item: Song) => void;
}

// Search Tab
// Albums Section
export interface AlbumSearchItem {
    id: string;
    title: string;
    artist: string;
    coverImageUri: string;
}

// Artists Section
export interface ArtistSearchItem {
    id: string;
    name: string;
    avatar: string;
}