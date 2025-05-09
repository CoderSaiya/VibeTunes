import {Song} from "@/types/song";
import {HubConnection} from "@microsoft/signalr";

export interface User {
    id: string
    name: string
    avatar?: string
}

export interface MusicRoom {
    id: string;
    hostId: string;
    name: string;
    participants: string[];
    currentSong: Song | null;
    playbackState: 'Stopped' | 'Playing' | 'Paused';
    currentTime: number;
}

export interface RoomInfoDto {
    roomId: string;
    name: string;
    participantCount: number;
}

export interface RoomState {
    connection: HubConnection | null;
    rooms: MusicRoom[];
    currentRoom: MusicRoom | null;
    isLoading: boolean;
    error: string | null;
    // Actions
    initConnection: () => Promise<void>;
    createRoom: (name: string) => Promise<void>;
    joinRoom: (roomId: string) => Promise<void>;
    leaveRoom: () => Promise<void>;
    updatePlayback: (
        state: 'Stopped' | 'Playing' | 'Paused',
        trackUrl: string,
        time: number
    ) => Promise<void>;
    fetchRooms: () => void;
}