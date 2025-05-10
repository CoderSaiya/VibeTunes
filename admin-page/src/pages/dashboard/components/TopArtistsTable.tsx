import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import useFetch from "../../../hooks/use-fetch.ts";
import {HotArtist, Response} from "../../../types";
import {Skeleton} from "../../../components/ui/skeleton.tsx";

// const topArtists = [
//     {
//         id: "1",
//         name: "Taylor Swift",
//         genre: "Pop",
//         streams: "1.2M",
//         image: "https://github.com/shadcn.png",
//         trending: true,
//     },
//     {
//         id: "2",
//         name: "The Weeknd",
//         genre: "R&B",
//         streams: "980K",
//         image: "https://github.com/shadcn.png",
//         trending: true,
//     },
//     {
//         id: "3",
//         name: "Bad Bunny",
//         genre: "Reggaeton",
//         streams: "875K",
//         image: "https://github.com/shadcn.png",
//         trending: false,
//     },
//     {
//         id: "4",
//         name: "Billie Eilish",
//         genre: "Pop",
//         streams: "760K",
//         image: "https://github.com/shadcn.png",
//         trending: true,
//     },
//     {
//         id: "5",
//         name: "Drake",
//         genre: "Hip-Hop",
//         streams: "720K",
//         image: "https://github.com/shadcn.png",
//         trending: false,
//     },
// ]

export const TopArtistsTable = () => {
    const {data: hotArtistResponse, loading} = useFetch<Response<HotArtist[]>>('api/Statistics/top-artists', {
        method: 'GET'
    });

    const data = hotArtistResponse?.data;

    const skeletonRows = Array(5).fill(0);

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

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead>
                        <tr className="border-b transition-colors hover:bg-muted/50">
                            <th className="h-12 px-4 text-left font-medium">Artist</th>
                            <th className="h-12 px-4 text-left font-medium">Genre</th>
                            <th className="h-12 px-4 text-left font-medium">Follower</th>
                            <th className="h-12 px-4 text-left font-medium">Streams</th>
                            <th className="h-12 px-4 text-left font-medium">Albums</th>
                            <th className="h-12 px-4 text-left font-medium">Songs</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            skeletonRows.map((_, index) => (
                                <tr key={`skeleton-${index}`} className="border-b">
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Skeleton className="h-4 w-16" />
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Skeleton className="h-4 w-12" />
                                    </td>
                                </tr>
                            ))
                        ) : data && data.length > 0 ? (
                            data.map((artist) => (
                                <tr key={artist.id} className="border-b transition-colors hover:bg-muted/50">
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={artist.avatar} alt={artist.name} />
                                                <AvatarFallback>{artist.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{artist.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">{artist.topGenre}</td>
                                    <td className="p-4 align-middle">{formatNumber(artist.followers)}</td>
                                    <td className="p-4 align-middle">{formatNumber(artist.streams)}</td>
                                    <td className="p-4 align-middle">{formatNumber(artist.albumCount)}</td>
                                    <td className="p-4 align-middle">{formatNumber(artist.songCount)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                    No artists found
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}