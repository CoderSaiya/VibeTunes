import {Song} from "@/types/song";

export interface Playlist {
    id: string;
    userId: string;
    name: string;
    description: string;
    coverImageUrl: string;
    likes: number;
    songsList: Song[];
    createdDate: string;
}