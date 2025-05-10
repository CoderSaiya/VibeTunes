"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import useFetch from "../../hooks/use-fetch.ts"
import { HotArtist, Response } from "@/types"

const ArtistsPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [sortBy, setSortBy] = useState("followers")
    const [sortOrder, setSortOrder] = useState("desc")
    const [selectedGenre, setSelectedGenre] = useState("all")

    const { data: artistResponse, loading } = useFetch<Response<HotArtist[]>>('api/Statistics/top-artists?Size=100', {
        method: 'GET'
    });

    const [artists, setArtists] = useState<HotArtist[]>([]);
    const [genres, setGenres] = useState<string[]>([]);

    useEffect(() => {
        if (artistResponse?.data) {
            setArtists(artistResponse.data);

            const uniqueGenres = [...new Set(artistResponse.data.map(artist => artist.topGenre))];
            setGenres(uniqueGenres);
        }
    }, [artistResponse]);

    const formatNumber = (num: number) => {
        if (num >= 1_000_000_000) {
            return (num / 1_000_000_000).toFixed(1) + 'B';
        }
        if (num >= 1_000_000) {
            return (num / 1_000_000).toFixed(1) + 'M';
        }
        if (num >= 1_000) {
            return (num / 1_000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    // Filter and sort artists
    const filteredArtists = artists
        .filter((artist) => {
            const matchesSearch =
                artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                artist.topGenre.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesGenre = selectedGenre === "all" || artist.topGenre === selectedGenre;

            return matchesSearch && matchesGenre;
        })
        .sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case "name":
                    valueA = a.name;
                    valueB = b.name;
                    break;
                case "followers":
                    valueA = a.followers;
                    valueB = b.followers;
                    break;
                case "streams":
                    valueA = a.streams;
                    valueB = b.streams;
                    break;
                case "albumCount":
                    valueA = a.albumCount;
                    valueB = b.albumCount;
                    break;
                case "songCount":
                    valueA = a.songCount;
                    valueB = b.songCount;
                    break;
                default:
                    valueA = a.followers;
                    valueB = b.followers;
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
    const currentArtists = filteredArtists.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredArtists.length / itemsPerPage);

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Artists</h2>
                    <p className="text-muted-foreground">Manage artists and their content</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Artist
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Artist Management</CardTitle>
                    <CardDescription>View and manage all artists on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search artists..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Genre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Genres</SelectItem>
                                        {genres.map(genre => (
                                            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="followers">Followers</SelectItem>
                                        <SelectItem value="streams">Streams</SelectItem>
                                        <SelectItem value="albumCount">Albums</SelectItem>
                                        <SelectItem value="songCount">Songs</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                                            Artist {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                                        </TableHead>
                                        <TableHead>Genre</TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort("followers")}>
                                            Followers {sortBy === "followers" && (sortOrder === "asc" ? "↑" : "↓")}
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort("streams")}>
                                            Streams {sortBy === "streams" && (sortOrder === "asc" ? "↑" : "↓")}
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort("albumCount")}>
                                            Albums {sortBy === "albumCount" && (sortOrder === "asc" ? "↑" : "↓")}
                                        </TableHead>
                                        <TableHead className="cursor-pointer" onClick={() => handleSort("songCount")}>
                                            Songs {sortBy === "songCount" && (sortOrder === "asc" ? "↑" : "↓")}
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        skeletonRows.map((_, index) => (
                                            <TableRow key={`skeleton-${index}`}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-10 w-10 rounded-full" />
                                                        <Skeleton className="h-4 w-32" />
                                                    </div>
                                                </TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredArtists.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No artists found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentArtists.map((artist) => (
                                            <TableRow key={artist.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={artist.avatar} alt={artist.name} />
                                                            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{artist.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{artist.topGenre}</Badge>
                                                </TableCell>
                                                <TableCell>{formatNumber(artist.followers)}</TableCell>
                                                <TableCell>{formatNumber(artist.streams)}</TableCell>
                                                <TableCell>{artist.albumCount}</TableCell>
                                                <TableCell>{artist.songCount}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                            <DropdownMenuItem>Edit Artist</DropdownMenuItem>
                                                            <DropdownMenuItem>View Albums</DropdownMenuItem>
                                                            <DropdownMenuItem>View Tracks</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive">Delete Artist</DropdownMenuItem>
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
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredArtists.length)} of {filteredArtists.length} artists
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
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ArtistsPage