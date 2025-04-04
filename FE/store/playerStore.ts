import { create } from "zustand"

interface Song {
    id: string
    title: string
    artist: string
    cover: string
    audio: string
}

interface PlayerState {
    currentSong: Song | null
    isPlaying: boolean
    queue: Song[]
    setCurrentSong: (song: Song) => void
    togglePlay: () => void
    nextSong: () => void
    prevSong: () => void
    addToQueue: (song: Song) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentSong: null,
    isPlaying: false,
    queue: [],
    setCurrentSong: (song: Song) => set({ currentSong: song, isPlaying: true }),
    togglePlay: () => set((state: PlayerState) => ({ isPlaying: !state.isPlaying })),
    nextSong: () => {
        const { queue, currentSong } = get()
        if (!currentSong || queue.length === 0) return

        const currentIndex = queue.findIndex((song: Song) => song.id === currentSong.id)
        if (currentIndex === -1 || currentIndex === queue.length - 1) return

        set({ currentSong: queue[currentIndex + 1] })
    },
    prevSong: () => {
        const { queue, currentSong } = get()
        if (!currentSong || queue.length === 0) return

        const currentIndex = queue.findIndex((song: Song) => song.id === currentSong.id)
        if (currentIndex <= 0) return

        set({ currentSong: queue[currentIndex - 1] })
    },
    addToQueue: (song: Song) => set((state: PlayerState) => ({ queue: [...state.queue, song] })),
}))