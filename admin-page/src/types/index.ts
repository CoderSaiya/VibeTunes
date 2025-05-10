export interface Response<T> {
    data: T;
    message: string;
    code: string;
    isSuccess: boolean;
}

type EntityStatistics = {
    entityName: string;
    totalCount: number;
    currentMonthCount: number;
    previousMonthCount: number;
    difference: number;
}

export interface DashboardData {
    users: EntityStatistics;
    artists: EntityStatistics;
    songs: EntityStatistics;
    playlists: EntityStatistics;
}

export interface UserArtistStatistics {
    name: string;
    users: number;
    artists: number;
}

export interface HotArtist {
    id: string;
    avatar: string;
    name: string;
    topGenre: string;
    followers: number;
    streams: number;
    albumCount: number;
    songCount: number;
}

export interface User {
    id: string;
    avatar: string;
    role: string;
    username: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    status: string;
}

export interface Album {
    id: string;
    coverImgUrl: string;
    title: string;
    avatar: string;
    artistName: string;
    releaseDate: string;
    songCount: number;
    topGenre: string;
}

export interface Song {
    id: string;
    title: string;
    albumTitle: string;
    artist: string;
    duration: string;
    coverImgUrl: string;
    fileUrl: string;
    releaseDate: string;
    streams: number;
    status: string;
}