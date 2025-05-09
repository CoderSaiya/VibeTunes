import { HubConnectionBuilder, type HubConnection, LogLevel } from "@microsoft/signalr"
import { useRoomStore } from "@/store/roomStore"
import {Song} from "@/types";
import type {Room, User} from "@/types/room";

class SignalRService {
    private connection: HubConnection | null = null
    private isConnected = false

    // Khởi tạo connection với signalR ở backend
    public async initializeConnection(token: string): Promise<void> {
        try {
            this.connection = new HubConnectionBuilder()
                .withUrl("", { //url hub, update sau
                    accessTokenFactory: () => token,
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build()

            // Thêm các handler cho từng event
            this.setupEventHandlers()

            // Bắt đầu kết nối
            await this.connection.start()
            this.isConnected = true
            console.log("SignalR Connected")
        } catch (error) {
            console.error("SignalR Connection Error:", error)
            throw error
        }
    }

    // Định nghĩa các handler cho các events
    private setupEventHandlers(): void {
        if (!this.connection) return

        // Cập nhật phòng
        this.connection.on("RoomUpdated", (room: Room) => {
            const { currentRoom } = useRoomStore.getState()
            if (currentRoom && currentRoom.id === room.id) {
                useRoomStore.setState({ currentRoom: room })
            }
        })

        // User mới tham gia vào phòng
        this.connection.on("UserJoined", (roomId: string, user: User) => {
            const { currentRoom } = useRoomStore.getState()
            if (currentRoom && currentRoom.id === roomId) {
                useRoomStore.setState({
                    currentRoom: {
                        ...currentRoom,
                        listeners: [...currentRoom.listeners, user],
                    },
                })
            }
        })

        // User rời phòng
        this.connection.on("UserLeft", (roomId: string, userId: string) => {
            const { currentRoom } = useRoomStore.getState()
            if (currentRoom && currentRoom.id === roomId) {
                useRoomStore.setState({
                    currentRoom: {
                        ...currentRoom,
                        listeners: currentRoom.listeners.filter((l) => l.id !== userId),
                    },
                })
            }
        })

        // Thêm bài hát vào queue
        this.connection.on("SongAddedToQueue", (roomId: string, song: Song) => {
            const { currentRoom } = useRoomStore.getState()
            if (currentRoom && currentRoom.id === roomId) {
                useRoomStore.setState({
                    currentRoom: {
                        ...currentRoom,
                        queue: [...currentRoom.queue, song],
                    },
                })
            }
        })

        // Bài hát được xóa khỏi queue
        this.connection.on("SongRemovedFromQueue", (roomId: string, songId: string) => {
            const { currentRoom } = useRoomStore.getState()
            if (currentRoom && currentRoom.id === roomId) {
                useRoomStore.setState({
                    currentRoom: {
                        ...currentRoom,
                        queue: currentRoom.queue.filter((s) => s.id !== songId),
                    },
                })
            }
        })

        // Bắt đầu phát bài nhạc
        this.connection.on("SongStartedPlaying", (roomId: string, song: Song) => {
            const { currentRoom } = useRoomStore.getState()
            if (currentRoom && currentRoom.id === roomId) {
                useRoomStore.setState({
                    currentRoom: {
                        ...currentRoom,
                        currentSong: song,
                        isPlaying: true,
                    },
                })
            }
        })

        // Dừng phát
        this.connection.on("SongPaused", (roomId: string) => {
            const { currentRoom } = useRoomStore.getState()
            if (currentRoom && currentRoom.id === roomId) {
                useRoomStore.setState({
                    currentRoom: {
                        ...currentRoom,
                        isPlaying: false,
                    },
                })
            }
        })

        // Qua bài khác
        this.connection.on("SongSkipped", (roomId: string, nextSong: Song | null) => {
            const { currentRoom } = useRoomStore.getState()
            if (currentRoom && currentRoom.id === roomId) {
                useRoomStore.setState({
                    currentRoom: {
                        ...currentRoom,
                        currentSong: nextSong || undefined,
                        isPlaying: nextSong !== null,
                        queue: nextSong ? currentRoom.queue.filter((s) => s.id !== nextSong.id) : currentRoom.queue,
                    },
                })
            }
        })
    }

    // Tham gia phòng
    public async joinRoom(roomId: string): Promise<void> {
        if (!this.connection || !this.isConnected) {
            throw new Error("SignalR connection not established")
        }

        try {
            await this.connection.invoke("JoinRoom", roomId)
        } catch (error) {
            console.error("Error joining room:", error)
            throw error
        }
    }

    // Rời khỏi phòng
    public async leaveRoom(roomId: string): Promise<void> {
        if (!this.connection || !this.isConnected) {
            throw new Error("SignalR connection not established")
        }

        try {
            await this.connection.invoke("LeaveRoom", roomId)
        } catch (error) {
            console.error("Error leaving room:", error)
            throw error
        }
    }

    // Thêm một bài vào queue
    public async addSongToQueue(roomId: string, song: Song): Promise<void> {
        if (!this.connection || !this.isConnected) {
            throw new Error("SignalR connection not established")
        }

        try {
            await this.connection.invoke("AddSongToQueue", roomId, song)
        } catch (error) {
            console.error("Error adding song to queue:", error)
            throw error
        }
    }

    // Xóa một bài khỏi queue của room
    public async removeSongFromQueue(roomId: string, songId: string): Promise<void> {
        if (!this.connection || !this.isConnected) {
            throw new Error("SignalR connection not established")
        }

        try {
            await this.connection.invoke("RemoveSongFromQueue", roomId, songId)
        } catch (error) {
            console.error("Error removing song from queue:", error)
            throw error
        }
    }

    // Phát nhạc
    public async playSong(roomId: string, songId: string): Promise<void> {
        if (!this.connection || !this.isConnected) {
            throw new Error("SignalR connection not established")
        }

        try {
            await this.connection.invoke("PlaySong", roomId, songId)
        } catch (error) {
            console.error("Error playing song:", error)
            throw error
        }
    }

    // Dừng phát
    public async pauseSong(roomId: string): Promise<void> {
        if (!this.connection || !this.isConnected) {
            throw new Error("SignalR connection not established")
        }

        try {
            await this.connection.invoke("PauseSong", roomId)
        } catch (error) {
            console.error("Error pausing song:", error)
            throw error
        }
    }

    // Chuyển bài khác
    public async skipSong(roomId: string): Promise<void> {
        if (!this.connection || !this.isConnected) {
            throw new Error("SignalR connection not established")
        }

        try {
            await this.connection.invoke("SkipSong", roomId)
        } catch (error) {
            console.error("Error skipping song:", error)
            throw error
        }
    }

    // Ngắt kết nối
    public async disconnect(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.stop()
                this.isConnected = false
                console.log("SignalR Disconnected")
            } catch (error) {
                console.error("Error disconnecting SignalR:", error)
                throw error
            }
        }
    }
}

// Tạo một singleton instance
export const signalRService = new SignalRService()