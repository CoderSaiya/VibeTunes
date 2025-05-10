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
import { Skeleton } from "../../components/ui/skeleton"
import { useToast } from "../../components/ui/use-toast"
import {
    MoreHorizontal,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import useFetch from "../../hooks/use-fetch.ts"
import { Album, Response } from "../../types"

interface AlbumFormData {
    title: string;
    artist: string;
    releaseDate: string;
    topGenre: string;
    coverImgUrl?: string;
}

const AlbumsPage = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedGenre, setSelectedGenre] = useState("all")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
    const [formData, setFormData] = useState<AlbumFormData>({
        title: "",
        artist: "",
        releaseDate: "",
        topGenre: "",
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [sortBy, setSortBy] = useState("releaseDate")
    const [sortOrder, setSortOrder] = useState("desc")
    const [genres, setGenres] = useState<string[]>([])
    const [statuses, setStatuses] = useState<string[]>(["Published", "Draft"])

    const { data: albumResponse, loading } = useFetch<Response<Album[]>>('api/Album?Filter.PageSize=100', {
        method: 'GET'
    });

    const [albums, setAlbums] = useState<Album[]>([]);
    const { toast } = useToast()

    useEffect(() => {
        if (albumResponse?.data) {
            setAlbums(albumResponse.data);

            const uniqueGenres = [
                ...new Set(
                    albumResponse.data
                        .map(album => album.topGenre || 'Unknown')
                        .filter(Boolean)
                )
            ];
            setGenres(uniqueGenres);
        }
    }, [albumResponse]);

    // Filter albums based on search query, genre, and status
    const filteredAlbums = albums.filter((album) => {
        const matchesSearch =
            album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            album.artistName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesGenre = selectedGenre === "all"
            || (album.topGenre || 'Unknown') === selectedGenre;

        return matchesSearch && matchesGenre
    }).sort((a, b) => {
        let valueA: any, valueB: any;

        switch (sortBy) {
            case "title":
                valueA = a.title;
                valueB = b.title;
                break;
            case "artist":
                valueA = a.artistName;
                valueB = b.artistName;
                break;
            case "releaseDate":
                valueA = new Date(a.releaseDate).getTime();
                valueB = new Date(b.releaseDate).getTime();
                break;
            case "songCount":
                valueA = a.songCount;
                valueB = b.songCount;
                break;
            default:
                valueA = new Date(a.releaseDate).getTime();
                valueB = new Date(b.releaseDate).getTime();
        }

        if (sortOrder === "asc") {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAlbums = filteredAlbums.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage);

    // Generate skeleton rows for loading state
    const skeletonRows = Array(itemsPerPage).fill(0);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id.replace('edit-', '')]: value }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleEdit = (album: Album) => {
        setSelectedAlbum(album)
        setFormData({
            title: album.title,
            artist: album.artistName,
            releaseDate: album.releaseDate,
            topGenre: album.topGenre,
            coverImgUrl: album.coverImgUrl
        })
        setIsEditDialogOpen(true)
    }

    const handleDelete = (album: Album) => {
        setSelectedAlbum(album)
        setIsDeleteDialogOpen(true)
    }

    const handleView = (album: Album) => {
        toast({
            title: "Album Details",
            description: `Viewing details for ${album.title}`,
        })
    }

    const handleSaveAlbum = () => {
        toast({
            title: "Success",
            description: isEditDialogOpen ? "Album updated successfully" : "New album created successfully",
        })
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
    }

    const handleConfirmDelete = () => {
        toast({
            title: "Album Deleted",
            description: `${selectedAlbum?.title} has been deleted`,
            variant: "destructive",
        })
        setIsDeleteDialogOpen(false)
    }

    const resetForm = () => {
        setFormData({
            title: "",
            artist: "",
            releaseDate: "",
            topGenre: "",
        });
    };

    const openAddDialog = () => {
        resetForm();
        setIsAddDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Albums</h1>
                <Button onClick={openAddDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Album
                </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search albums..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Genre" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Genres</SelectItem>
                            {genres.map(genre => (
                                <SelectItem key={genre} value={genre}>
                                    {genre === 'Unknown' ? 'Unknown Genre' : genre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {statuses.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[150px] hidden md:flex">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="artist">Artist</SelectItem>
                            <SelectItem value="releaseDate">Release Date</SelectItem>
                            <SelectItem value="songCount">Tracks</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        className="hidden md:flex"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                        {sortOrder === "asc" ? "Ascending" : "Descending"}
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                                Album {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("artist")}>
                                Artist {sortBy === "artist" && (sortOrder === "asc" ? "↑" : "↓")}
                            </TableHead>
                            <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort("releaseDate")}>
                                Release Date {sortBy === "releaseDate" && (sortOrder === "asc" ? "↑" : "↓")}
                            </TableHead>
                            <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort("songCount")}>
                                Tracks {sortBy === "songCount" && (sortOrder === "asc" ? "↑" : "↓")}
                            </TableHead>
                            <TableHead className="hidden md:table-cell">Genre</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            skeletonRows.map((_, index) => (
                                <TableRow key={`skeleton-${index}`}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-md" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredAlbums.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No albums found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentAlbums.map((album) => (
                                <TableRow key={album.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={album.coverImgUrl || "/placeholder.svg?height=60&width=60"}
                                                alt={album.title}
                                                className="h-10 w-10 rounded-md object-cover"
                                            />
                                            <span className="line-clamp-1">{album.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{album.artistName}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {new Date(album.releaseDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{album.songCount}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant="outline">{album.topGenre || 'Unknown'}</Badge>
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
                                                <DropdownMenuItem onClick={() => handleView(album)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(album)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(album)}
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
            {!loading && filteredAlbums.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAlbums.length)} of {filteredAlbums.length} albums
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                            setItemsPerPage(parseInt(value));
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Calculate page numbers to show (centered around current page)
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={`page-${pageNum}`}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => handlePageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Album Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Add New Album</DialogTitle>
                        <DialogDescription>Create a new album to add to your music catalog.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                className="col-span-3"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="artist" className="text-right">
                                Artist
                            </Label>
                            <Input
                                id="artist"
                                className="col-span-3"
                                value={formData.artist}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="releaseDate" className="text-right">
                                Release Date
                            </Label>
                            <Input
                                id="releaseDate"
                                type="date"
                                className="col-span-3"
                                value={formData.releaseDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="topGenre" className="text-right">
                                Genre
                            </Label>
                            <Select
                                value={formData.topGenre}
                                onValueChange={(value) => handleSelectChange("topGenre", value)}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select genre" />
                                </SelectTrigger>
                                <SelectContent>
                                    {genres.map(genre => (
                                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cover" className="text-right">
                                Cover Image
                            </Label>
                            <Input id="cover" type="file" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveAlbum}>Save Album</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Album Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Edit Album</DialogTitle>
                        <DialogDescription>Make changes to the album information.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="edit-title"
                                className="col-span-3"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-artist" className="text-right">
                                Artist
                            </Label>
                            <Input
                                id="edit-artist"
                                className="col-span-3"
                                value={formData.artist}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-releaseDate" className="text-right">
                                Release Date
                            </Label>
                            <Input
                                id="edit-releaseDate"
                                type="date"
                                className="col-span-3"
                                value={formData.releaseDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-topGenre" className="text-right">
                                Genre
                            </Label>
                            <Select
                                value={formData.topGenre}
                                onValueChange={(value) => handleSelectChange("topGenre", value)}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select genre" />
                                </SelectTrigger>
                                <SelectContent>
                                    {genres.map(genre => (
                                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-cover" className="text-right">
                                Cover Image
                            </Label>
                            <div className="col-span-3 flex items-center gap-4">
                                <img
                                    src={formData.coverImgUrl || "/placeholder.svg"}
                                    alt={formData.title}
                                    className="h-12 w-12 rounded-md object-cover"
                                />
                                <Input id="edit-cover" type="file" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveAlbum}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the album "{selectedAlbum?.title}"? This action cannot be undone.
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

export default AlbumsPage