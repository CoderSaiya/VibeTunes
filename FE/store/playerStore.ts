import { create } from "zustand"
import {PlayerState, RepeatMode} from "@/types";
import {Song} from "@/types/song";

export const usePlayerStore = create<PlayerState>((set, get) => ({
    // Song management
    currentSong: null,
    queue: [],

    // Playback controls
    isPlaying: false,

    // Playback state
    progress: 0,
    duration: 0,
    currentTime: 0,

    // UI state
    isPlayerScreenVisible: false,

    // Playback modes
    shuffleMode: false,
    repeatMode: 'off',

    setCurrentSong: (song: Song | null) => {
        if (!song) {
            set({ currentSong: null, isPlaying: false })
            return
        }

        const { queue } = get()
        const songExists = queue.some((s: Song) => s.id === song.id)

        if (!songExists) {
            set((state: PlayerState) => ({
                queue: [...state.queue, song],
                currentSong: song,
                isPlaying: true
            }))
        } else {
            set({ currentSong: song, isPlaying: true })
        }
    },

    togglePlay: () => set((state: PlayerState) => ({ isPlaying: !state.isPlaying })),

    nextSong: () => {
        const { queue, currentSong, repeatMode, shuffleMode } = get()
        if (!currentSong || queue.length === 0) return

        const currentIndex = queue.findIndex((song: Song) => song.id === currentSong.id)

        if (repeatMode === 'one') {
            return
        }

        if (shuffleMode) {
            const availableSongs = queue.filter(song => song.id !== currentSong.id)
            if (availableSongs.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableSongs.length)
                set({ currentSong: availableSongs[randomIndex] })
                return
            }
        }

        // Normal sequential playback
        if (currentIndex === queue.length - 1) {
            if (repeatMode === 'all') {
                set({ currentSong: queue[0] })
            }
        } else {
            set({ currentSong: queue[currentIndex + 1] })
        }
    },

    prevSong: () => {
        const { queue, currentSong, currentTime } = get()
        if (!currentSong || queue.length === 0) return

        if (currentTime > 3) {
            get().seekTo(0)
            return
        }

        const currentIndex = queue.findIndex((song: Song) => song.id === currentSong.id)
        if (currentIndex <= 0) return

        set({ currentSong: queue[currentIndex - 1] })
    },

    addToQueue: (song: Song) => {
        set((state: PlayerState) => {
            const songExists = state.queue.some((s: Song) => s.id === song.id)
            if (songExists) return state

            return { queue: [...state.queue, song] }
        })
    },

    seekTo: (position: number) => {
        set({ progress: position })
    },

    setProgress: (progress: number) => set({ progress }),
    setDuration: (duration: number) => set({ duration }),
    setCurrentTime: (currentTime: number) => set({ currentTime }),

    setPlayerScreenVisible: (visible: boolean) => {
        set({ isPlayerScreenVisible: visible })
    },

    toggleShuffleMode: () => {
        set((state: PlayerState) => ({ shuffleMode: !state.shuffleMode }))
    },

    toggleRepeatMode: () => {
        set((state: PlayerState) => {
            const currentMode = state.repeatMode
            // Cycle through repeat modes: off -> all -> one -> off
            let newMode: RepeatMode = 'off'

            if (currentMode === 'off') newMode = 'all'
            else if (currentMode === 'all') newMode = 'one'
            else if (currentMode === 'one') newMode = 'off'

            return { repeatMode: newMode }
        })
    }
}))