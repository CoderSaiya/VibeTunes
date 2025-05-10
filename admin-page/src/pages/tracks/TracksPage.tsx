"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { useToast } from "../../components/ui/use-toast"
import {
    MoreHorizontal,
    Plus,
    Search,
    Play,
    Pause,
    Edit,
    Trash2,
    Clock,
    Disc,
    BarChart2,
    ChevronLeft,
    ChevronRight } from "lucide-react"
import useFetch from "../../hooks/use-fetch.ts"
import { Response, Song } from "../../types"
import { Skeleton } from "../../components/ui/skeleton"

const ITEMS_PER_PAGE = 10

const TracksPage = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedTrack, setSelectedTrack] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const { toast } = useToast()

    const { data: response, loading } = useFetch<Response<Song[]>>(`api/Song?Filter.PageSize=100`, {
        method: 'GET',
        headers: {'X-Custom-Header': 'value'}
    })

    const songs = response?.data || []

    useEffect(() => {
        // Clean up audio when component unmounts
        return () => {
            if (audioElement) {
                audioElement.pause()
                audioElement.src = ""
            }
        }
    }, [audioElement])

    // Filter tracks based on search query, genre, and status
    const filteredTracks = songs.filter((track) => {
        const matchesSearch =
            track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
            track.albumTitle.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = selectedStatus === "all" || track.status === selectedStatus

        return matchesSearch && matchesStatus
    })

    // Calculate total pages
    useEffect(() => {
        setTotalPages(Math.ceil(filteredTracks.length / ITEMS_PER_PAGE))
        // Reset to first page when filters change
        setCurrentPage(1)
    }, [filteredTracks.length])

    // Get current page items
    const currentItems = filteredTracks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const handlePlayPause = (track: Song) => {
        if (isPlaying === track.id) {
            if (audioElement) {
                audioElement.pause()
            }
            setIsPlaying(null)
            toast({
                title: "Playback Paused",
                description: "Track playback has been paused",
            })
        } else {
            if (audioElement) {
                audioElement.pause()
            }

            const audio = new Audio(track.fileUrl)
            audio.play().catch(error => {
                console.error("Error playing audio:", error)
                toast({
                    title: "Playback Error",
                    description: "Could not play the track.",
                    variant: "destructive"
                })
            })

            setAudioElement(audio)
            setIsPlaying(track.id)
            toast({
                title: "Now Playing",
                description: `${track.title} by ${track.artist}`,
            })
        }
    }

    const handleEdit = (track: Song) => {
        setSelectedTrack(track)
        setIsEditDialogOpen(true)
    }

    const handleDelete = (track: Song) => {
        setSelectedTrack(track)
        setIsDeleteDialogOpen(true)
    }

    const handleSaveTrack = () => {
        toast({
            title: "Success",
            description: isEditDialogOpen ? "Track updated successfully" : "New track created successfully",
        })
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
    }

    const handleConfirmDelete = () => {
        toast({
            title: "Track Deleted",
            description: `${selectedTrack?.title} has been deleted`,
            variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
    }

    const formatNumber = (num : number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M"
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K"
        }
        return num.toString()
    }

    // Format date to readable string
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1))
    }

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages))
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Tracks</h1>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Track
                </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tracks..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead style={{ width: 50 }}></TableHead>
                            <TableHead>Track</TableHead>
                            <TableHead className="hidden md:table-cell">Album</TableHead>
                            <TableHead className="hidden md:table-cell">Duration</TableHead>
                            <TableHead className="hidden lg:table-cell">Release Date</TableHead>
                            <TableHead className="hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                    <BarChart2 className="h-4 w-4" />
                                    <span>Streams</span>
                                </div>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={`skeleton-${index}`}>
                                    <TableCell>
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-md" />
                                            <div className="w-full space-y-2">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Skeleton className="h-4 w-20" />
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Skeleton className="h-4 w-12" />
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <Skeleton className="h-4 w-24" />
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <Skeleton className="h-4 w-16" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : currentItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    No tracks found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentItems.map((track) => (
                                <TableRow key={track.id}>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePlayPause(track)}>
                                            {isPlaying === track.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                            <span className="sr-only">{isPlaying === track.id ? "Pause" : "Play"}</span>
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={track.coverImgUrl || "/placeholder.svg"}
                                                alt={track.title}
                                                className="h-10 w-10 rounded-md object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium line-clamp-1">{track.title}</span>
                                                <span className="text-sm text-muted-foreground line-clamp-1">
                                                    {track.artist}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Disc className="h-4 w-4 text-muted-foreground" />
                                            <span className="line-clamp-1">{track.albumTitle}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{track.duration}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {formatDate(track.releaseDate)}
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">{formatNumber(track.streams)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                track.status === "Active" ? "default" :
                                                    track.status === "Banned" ? "secondary" :
                                                        track.status === "Pending" ? "outline" : "destructive"
                                            }
                                        >
                                            {track.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(track)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(track)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {!loading && filteredTracks.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTracks.length)} of {filteredTracks.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous Page</span>
                        </Button>
                        <div className="text-sm">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next Page</span>
                        </Button>
                    </div>
                </div>
            )}

            {/* Add Track Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Add New Track</DialogTitle>
                        <DialogDescription>Create a new track to add to your music catalog.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input id="title" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="artist" className="text-right">
                                Artist
                            </Label>
                            <Input id="artist" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="album" className="text-right">
                                Album
                            </Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select album" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Midnight Memories">Midnight Memories</SelectItem>
                                    <SelectItem value="Summer Vibes">Summer Vibes</SelectItem>
                                    <SelectItem value="Urban Echoes">Urban Echoes</SelectItem>
                                    <SelectItem value="Acoustic Sessions">Acoustic Sessions</SelectItem>
                                    <SelectItem value="Electronic Dreams">Electronic Dreams</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">
                                Duration
                            </Label>
                            <Input id="duration" placeholder="e.g. 3:45" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="release-date" className="text-right">
                                Release Date
                            </Label>
                            <Input id="release-date" type="date" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Published">Published</SelectItem>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="audio" className="text-right">
                                Audio File
                            </Label>
                            <Input id="audio" type="file" accept="audio/*" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cover" className="text-right">
                                Cover Image
                            </Label>
                            <Input id="cover" type="file" accept="image/*" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveTrack}>Save Track</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Track Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Edit Track</DialogTitle>
                        <DialogDescription>Make changes to the track information.</DialogDescription>
                    </DialogHeader>
                    {selectedTrack && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-title" className="text-right">
                                    Title
                                </Label>
                                <Input id="edit-title" className="col-span-3" defaultValue={selectedTrack.title} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-artist" className="text-right">
                                    Artist
                                </Label>
                                <Input id="edit-artist" className="col-span-3" defaultValue={selectedTrack.artist} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-album" className="text-right">
                                    Album
                                </Label>
                                <Select defaultValue={selectedTrack.albumTitle}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select album" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Midnight Memories">Midnight Memories</SelectItem>
                                        <SelectItem value="Summer Vibes">Summer Vibes</SelectItem>
                                        <SelectItem value="Urban Echoes">Urban Echoes</SelectItem>
                                        <SelectItem value="Acoustic Sessions">Acoustic Sessions</SelectItem>
                                        <SelectItem value="Electronic Dreams">Electronic Dreams</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-duration" className="text-right">
                                    Duration
                                </Label>
                                <Input id="edit-duration" className="col-span-3" defaultValue={selectedTrack.duration} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-release-date" className="text-right">
                                    Release Date
                                </Label>
                                <Input
                                    id="edit-release-date"
                                    type="date"
                                    className="col-span-3"
                                    defaultValue={new Date(selectedTrack.releaseDate).toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-status" className="text-right">
                                    Status
                                </Label>
                                <Select defaultValue={selectedTrack.status}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Published">Published</SelectItem>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Processing">Processing</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-audio" className="text-right">
                                    Audio File
                                </Label>
                                <div className="col-span-3">
                                    <div className="mb-2 text-sm text-muted-foreground break-all">
                                        Current: {selectedTrack.fileUrl.split('/').pop()}
                                    </div>
                                    <Input id="edit-audio" type="file" accept="audio/*" />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-cover" className="text-right">
                                    Cover Image
                                </Label>
                                <div className="col-span-3 flex items-center gap-4">
                                    <img
                                        src={selectedTrack.coverImgUrl || "/placeholder.svg"}
                                        alt={selectedTrack.title}
                                        className="h-12 w-12 rounded-md object-cover"
                                    />
                                    <Input id="edit-cover" type="file" accept="image/*" />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveTrack}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the track "{selectedTrack?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TracksPage