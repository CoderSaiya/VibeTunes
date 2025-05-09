import {Song} from "@/types/song";

export interface Album {
    id: string,
    artistId: string,
    artist: string,
    title: string,
    releaseDate: string,
    streams: number,
    coverImgUrl: string,
    isReleased: boolean,
    songsList: Song[]
}