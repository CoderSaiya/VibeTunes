import { create } from "zustand"
import {RoomState} from "@/types/room";
import {HttpTransportType, HubConnectionBuilder, LogLevel} from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Song} from "@/types/song";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const useRoomStore = create<RoomState>((set, get) => ({
    connection: null,
    rooms: [],
    currentRoom: null,
    isLoading: false,
    error: null,

    initConnection: async () => {
        if (get().connection) return;
        set({ isLoading: true, error: null });
        try {
            // Lấy userId từ AsyncStorage
            const storedUserId = await AsyncStorage.getItem('userId');
            if (!storedUserId) throw new Error('User ID không tìm thấy');
            console.log('User ID:', storedUserId);

            const token = await AsyncStorage.getItem("accessToken");
            if (!token) throw new Error("Chưa có access token");
            console.log("Access token:", token);

            // Khởi tạo SignalR connection với query param userId
            const connection = new HubConnectionBuilder()
                .withUrl(
                    `${BASE_URL}/api/musicHub?userId=${storedUserId}`,
                    {
                        skipNegotiation: true,
                        transport: HttpTransportType.WebSockets,
                        accessTokenFactory: () => token,
                    }
                )
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();

            console.log("SignalR Connected on :", connection.connectionId);

            // Đăng ký các sự kiện từ server
            connection.on('RoomCreated', (roomId: string) => {
                set({
                    currentRoom: {
                        id: roomId,
                        name: '', // Add name property to match backend
                        hostId: storedUserId,
                        participants: [storedUserId],
                        currentSong: null,
                        playbackState: 'Stopped',
                        currentTime: 0,
                    },
                });
            });

            connection.on('RoomJoined', (roomId: string) => {
                set(state => ({
                    currentRoom: {
                        id: roomId,
                        name: '', // Add name property to match backend
                        hostId: '', // Will be updated when room info is received
                        participants: [storedUserId],
                        currentSong: null,
                        playbackState: 'Stopped',
                        currentTime: 0,
                    }
                }));
            });

            connection.on('UserJoined', (userId: string) => {
                set(state => ({
                    currentRoom: state.currentRoom
                        ? { ...state.currentRoom, participants: [...state.currentRoom.participants, userId] }
                        : null,
                }));
            });

            connection.on('UserLeft', (userId: string) => {
                set(state => ({
                    currentRoom: state.currentRoom
                        ? { ...state.currentRoom, participants: state.currentRoom.participants.filter(u => u !== userId) }
                        : null,
                }));
            });

            connection.on('PlaybackUpdated', (stateDesc: string, song: Song, time: number) => {
                set(state => ({
                    currentRoom: state.currentRoom
                        ? { ...state.currentRoom, playbackState: stateDesc as any, song, currentTime: time }
                        : null,
                }));
            });

            connection.on('RoomClosed', () => {
                set({ currentRoom: null });
            });

            connection.on('PlaybackStopped', () => {
                set(state => ({
                    currentRoom: state.currentRoom
                        ? { ...state.currentRoom, playbackState: 'Stopped', currentTime: 0 }
                        : null,
                }));
            });

            connection.on('Error', (msg: string) => {
                set({ error: msg });
            });

            await connection.start();
            set({ connection, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    createRoom: async (name: string) => {
        const { connection } = get();
        if (!connection) throw new Error('Hub chưa được khởi tạo');
        set({ isLoading: true, error: null });
        try {
            // Pass the room name parameter to match backend method signature
            await connection.invoke('CreateRoom', name);
            set({ isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    joinRoom: async (roomId: string) => {
        const { connection } = get();
        if (!connection) throw new Error('Hub chưa được khởi tạo');
        set({ isLoading: true, error: null });
        try {
            await connection.invoke('JoinRoom', roomId);
            set({ isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    leaveRoom: async () => {
        const { connection } = get();
        if (!connection) throw new Error('Hub chưa được khởi tạo');
        set({ isLoading: true, error: null });
        try {
            await connection.invoke('LeaveRoom');
            set({ currentRoom: null, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updatePlayback: async (state: string, songId: string, time: number) => {
        const { connection } = get();
        if (!connection) throw new Error('Hub chưa được khởi tạo');
        set({ isLoading: true, error: null });
        try {
            // Updated to match backend signature
            await connection.invoke('UpdatePlayback', state, songId, time);
            set({ isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchRooms: async () => {
        const { connection } = get();
        if (!connection) throw new Error('Hub chưa được khởi tạo');
        set({ isLoading: true, error: null });
        try {
            const rooms = await connection.invoke('GetAllRooms');
            set({ rooms, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    }
}));