"use client"

import { useState } from "react"
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
import { Textarea } from "../../components/ui/textarea"
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
import { Switch } from "../../components/ui/switch"
import { useToast } from "../../components/ui/use-toast"
import { MoreHorizontal, Plus, Search, Users, Calendar, Music, Edit, Trash2, Eye, Lock, Globe } from "lucide-react"

// Mock data for playlists
const mockPlaylists = [
    {
        id: "1",
        title: "Summer Hits 2023",
        description: "The hottest tracks of summer 2023",
        creator: "Music Admin",
        tracks: 24,
        followers: 12543,
        isPublic: true,
        isFeatured: true,
        createdAt: "2023-05-15",
        updatedAt: "2023-11-20",
        coverUrl: "/placeholder.svg?height=60&width=60",
    },
    {
        id: "2",
        title: "Workout Motivation",
        description: "High-energy tracks to fuel your workout",
        creator: "Fitness Team",
        tracks: 18,
        followers: 8765,
        isPublic: true,
        isFeatured: true,
        createdAt: "2023-06-22",
        updatedAt: "2023-11-18",
        coverUrl: "/placeholder.svg?height=60&width=60",
    },
    {
        id: "3",
        title: "Chill Vibes",
        description: "Relaxing tracks for your downtime",
        creator: "Mood Curator",
        tracks: 32,
        followers: 15678,
        isPublic: true,
        isFeatured: false,
        createdAt: "2023-04-10",
        updatedAt: "2023-10-05",
        coverUrl: "/placeholder.svg?height=60&width=60",
    },
    {
        id: "4",
        title: "Top 50 Global",
        description: "The most popular tracks worldwide",
        creator: "Charts Team",
        tracks: 50,
        followers: 45678,
        isPublic: true,
        isFeatured: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-11-22",
        coverUrl: "/placeholder.svg?height=60&width=60",
    },
    {
        id: "5",
        title: "New Releases",
        description: "Fresh tracks from your favorite artists",
        creator: "Release Team",
        tracks: 42,
        followers: 9876,
        isPublic: true,
        isFeatured: false,
        createdAt: "2023-11-01",
        updatedAt: "2023-11-21",
        coverUrl: "/placeholder.svg?height=60&width=60",
    },
    {
        id: "6",
        title: "Staff Picks",
        description: "Curated selection from our music experts",
        creator: "Editorial Team",
        tracks: 15,
        followers: 6543,
        isPublic: false,
        isFeatured: false,
        createdAt: "2023-10-15",
        updatedAt: "2023-11-15",
        coverUrl: "/placeholder.svg?height=60&width=60",
    },
]

const PlaylistsPage = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [visibilityFilter, setVisibilityFilter] = useState("all")
    const [featuredFilter, setFeaturedFilter] = useState("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null)

    const { toast } = useToast()

    // Filter playlists based on search query and filters
    const filteredPlaylists = mockPlaylists.filter((playlist) => {
        const matchesSearch =
            playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            playlist.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            playlist.creator.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesVisibility =
            visibilityFilter === "all" ||
            (visibilityFilter === "public" && playlist.isPublic) ||
            (visibilityFilter === "private" && !playlist.isPublic)
        const matchesFeatured =
            featuredFilter === "all" ||
            (featuredFilter === "featured" && playlist.isFeatured) ||
            (featuredFilter === "not-featured" && !playlist.isFeatured)

        return matchesSearch && matchesVisibility && matchesFeatured
    })

    const handleEdit = (playlist: any) => {
        setSelectedPlaylist(playlist)
        setIsEditDialogOpen(true)
    }

    const handleDelete = (playlist: any) => {
        setSelectedPlaylist(playlist)
        setIsDeleteDialogOpen(true)
    }

    const handleView = (playlist: any) => {
        toast({
            title: "Playlist Details",
            description: `Viewing details for ${playlist.title}`,
        })
    }

    const handleSavePlaylist = () => {
        toast({
            title: "Success",
            description: isEditDialogOpen ? "Playlist updated successfully" : "New playlist created successfully",
        })
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
    }

    const handleConfirmDelete = () => {
        toast({
            title: "Playlist Deleted",
            description: `${selectedPlaylist?.title} has been deleted`,
            variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M"
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K"
        }
        return num.toString()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Playlists</h1>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Playlist
                </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search playlists..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Visibility" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Visibility</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Featured" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Playlists</SelectItem>
                            <SelectItem value="featured">Featured</SelectItem>
                            <SelectItem value="not-featured">Not Featured</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Playlist</TableHead>
                            <TableHead className="hidden md:table-cell">Creator</TableHead>
                            <TableHead className="hidden md:table-cell">
                                <div className="flex items-center gap-1">
                                    <Music className="h-4 w-4" />
                                    <span>Tracks</span>
                                </div>
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>Followers</span>
                                </div>
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Updated</span>
                                </div>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPlaylists.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No playlists found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPlaylists.map((playlist) => (
                                <TableRow key={playlist.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={playlist.coverUrl || "/placeholder.svg"}
                                                alt={playlist.title}
                                                className="h-10 w-10 rounded-md object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <span className="line-clamp-1">{playlist.title}</span>
                                                <span className="text-sm text-muted-foreground line-clamp-1">{playlist.description}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{playlist.creator}</TableCell>
                                    <TableCell className="hidden md:table-cell">{playlist.tracks}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{formatNumber(playlist.followers)}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{playlist.updatedAt}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={playlist.isPublic ? "default" : "outline"}>
                                                <div className="flex items-center gap-1">
                                                    {playlist.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                                    <span>{playlist.isPublic ? "Public" : "Private"}</span>
                                                </div>
                                            </Badge>
                                            {playlist.isFeatured && (
                                                <Badge variant="secondary" className="mt-1">
                                                    Featured
                                                </Badge>
                                            )}
                                        </div>
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
                                                <DropdownMenuItem onClick={() => handleView(playlist)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(playlist)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(playlist)}
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

            {/* Add Playlist Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Create New Playlist</DialogTitle>
                        <DialogDescription>Create a new playlist to showcase your music collection.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input id="title" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">
                                Description
                            </Label>
                            <Textarea id="description" className="col-span-3" placeholder="Describe this playlist" rows={3} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="creator" className="text-right">
                                Creator
                            </Label>
                            <Input id="creator" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="visibility" className="text-right">
                                Visibility
                            </Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch id="visibility" />
                                <Label htmlFor="visibility" className="cursor-pointer">
                                    Make this playlist public
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="featured" className="text-right">
                                Featured
                            </Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch id="featured" />
                                <Label htmlFor="featured" className="cursor-pointer">
                                    Feature this playlist on the homepage
                                </Label>
                            </div>
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
                        <Button onClick={handleSavePlaylist}>Create Playlist</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Playlist Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Edit Playlist</DialogTitle>
                        <DialogDescription>Make changes to the playlist information.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-title" className="text-right">
                                Title
                            </Label>
                            <Input id="edit-title" className="col-span-3" defaultValue={selectedPlaylist?.title} />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="edit-description" className="text-right pt-2">
                                Description
                            </Label>
                            <Textarea
                                id="edit-description"
                                className="col-span-3"
                                defaultValue={selectedPlaylist?.description}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-creator" className="text-right">
                                Creator
                            </Label>
                            <Input id="edit-creator" className="col-span-3" defaultValue={selectedPlaylist?.creator} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-visibility" className="text-right">
                                Visibility
                            </Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch id="edit-visibility" defaultChecked={selectedPlaylist?.isPublic} />
                                <Label htmlFor="edit-visibility" className="cursor-pointer">
                                    Make this playlist public
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-featured" className="text-right">
                                Featured
                            </Label>
                            <div className="col-span-3 flex items-center space-x-2">
                                <Switch id="edit-featured" defaultChecked={selectedPlaylist?.isFeatured} />
                                <Label htmlFor="edit-featured" className="cursor-pointer">
                                    Feature this playlist on the homepage
                                </Label>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-cover" className="text-right">
                                Cover Image
                            </Label>
                            <div className="col-span-3 flex items-center gap-4">
                                <img
                                    src={selectedPlaylist?.coverUrl || "/placeholder.svg"}
                                    alt={selectedPlaylist?.title}
                                    className="h-12 w-12 rounded-md object-cover"
                                />
                                <Input id="edit-cover" type="file" accept="image/*" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSavePlaylist}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the playlist "{selectedPlaylist?.title}"? This action cannot be undone.
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

export default PlaylistsPage