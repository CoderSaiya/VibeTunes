import {Song} from "@/types/song";
import {Album} from "@/types/album";

export interface User {
    id: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    rank: string;
    isActive: boolean;
    isBanned: boolean;
    address: {
        street: string;
        district: string;
        city: string;
        country: string;
    }
    gender: string;
    avatar: string;
    userType: string;
}

export interface Artist extends User {
    stageName: string;
    bio: string;
}

export interface Profile {
    name: {
        firstName: string;
        lastName: string;
    };
    stageName?: string | null;
    bio?: string | null;
    address: {
        street: string;
        district: string;
        city: string;
        country: string;
    };
    gender: string;
    avatar: string;
    history: string[];
    followers: number,
    following: number,
    topGenres: string[],
    latestSong: Song[],
    playlists: number;
}

export interface ArtistProfile {
    id: string;
    stageName: string;
    avatar: string;
    followers: number;
    bio: string;
    popularSongs: Song[];
    albums: Album[];
}