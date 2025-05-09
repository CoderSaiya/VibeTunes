import {ImagePickerAsset} from "expo-image-picker";
import {DocumentPickerAsset} from "expo-document-picker";

export interface CreateSongRequest {
    artistId: string
    albumId?: string
    title: string
    image: ImagePickerAsset
    audio: DocumentPickerAsset
    releaseDate: Date
    genre: string
}

export interface Genre {
    id: string
    name: string
}