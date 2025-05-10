"use client"

import {useEffect, useState } from "react"
import {
    PlusCircle,
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpDown,
    ChevronDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import useFetch from "../../hooks/use-fetch.ts";
import {User, Response} from "../../types";
import {Skeleton} from "../../components/ui/skeleton.tsx";

// Mock data
// const users = [
//     {
//         id: "1",
//         name: "John Doe",
//         email: "john@example.com",
//         role: "user",
//         status: "active",
//         joinDate: "2023-01-15",
//         image: "https://github.com/shadcn.png",
//     },
//     {
//         id: "2",
//         name: "Jane Smith",
//         email: "jane@example.com",
//         role: "premium",
//         status: "active",
//         joinDate: "2023-02-20",
//         image: "https://github.com/shadcn.png",
//     },
//     {
//         id: "3",
//         name: "Alex Johnson",
//         email: "alex@example.com",
//         role: "artist",
//         status: "active",
//         joinDate: "2023-03-10",
//         image: "https://github.com/shadcn.png",
//     },
//     {
//         id: "4",
//         name: "Sarah Williams",
//         email: "sarah@example.com",
//         role: "admin",
//         status: "active",
//         joinDate: "2023-01-05",
//         image: "https://github.com/shadcn.png",
//     },
//     {
//         id: "5",
//         name: "Michael Brown",
//         email: "michael@example.com",
//         role: "user",
//         status: "inactive",
//         joinDate: "2023-04-18",
//         image: "https://github.com/shadcn.png",
//     },
//     {
//         id: "6",
//         name: "Emily Davis",
//         email: "emily@example.com",
//         role: "premium",
//         status: "active",
//         joinDate: "2023-05-22",
//         image: "https://github.com/shadcn.png",
//     },
//     {
//         id: "7",
//         name: "David Wilson",
//         email: "david@example.com",
//         role: "user",
//         status: "suspended",
//         joinDate: "2023-02-28",
//         image: "https://github.com/shadcn.png",
//     },
//     {
//         id: "8",
//         name: "Olivia Martinez",
//         email: "olivia@example.com",
//         role: "artist",
//         status: "active",
//         joinDate: "2023-06-14",
//         image: "https://github.com/shadcn.png",
//     },
// ]

const getRoleBadge = (role: string) => {
    switch (role) {
        case "admin":
            return <Badge className="bg-red-500">Admin</Badge>
        case "artist":
            return <Badge className="bg-purple-500">Artist</Badge>
        case "premium":
            return <Badge className="bg-amber-500">Premium</Badge>
        default:
            return <Badge variant="outline">User</Badge>
    }
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "active":
            return <Badge className="bg-green-500">Active</Badge>
        case "inactive":
            return <Badge variant="outline">Inactive</Badge>
        case "suspended":
            return <Badge className="bg-red-500">Suspended</Badge>
        default:
            return <Badge variant="outline">Unknown</Badge>
    }
}

const UsersPage = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPage, setSelectedPage] = useState(1);
    const [itemsPerPage, setItemPerPage] = useState(8)
    const [sortField, setSortField] = useState("")
    const [sortDirection, setSortDirection] = useState("desc")
    const [filterRole, setFilterRole] = useState<string[]>([])
    const [filterStatus, setFilterStatus] = useState<string[]>([])

    const {data: response, loading, error} = useFetch<Response<User[]>>(`api/User?Filter.PageSize=100&IsArtist=false`, {
        method: 'GET',
        headers: {'X-Custom-Header': 'value'}
    });

    const users = response?.data
        ? response.data.map(user => {
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            const fullName = (firstName + ' ' + lastName).trim();

            const displayName = fullName || user.username || 'Unnamed User';

            return {
                ...user,
                name: displayName,
            };
        })
        : [];

    const filteredAndSortedUsers = (() => {
        let result = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterRole.length > 0) {
            result = result.filter(user => filterRole.includes(user.role));
        }

        if (filterStatus.length > 0) {
            result = result.filter(user => filterStatus.includes(user.status));
        }

        result.sort((a, b) => {
            const fieldA = a[sortField]?.toString().toLowerCase() || '';
            const fieldB = b[sortField]?.toString().toLowerCase() || '';

            if (fieldA < fieldB) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (fieldA > fieldB) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return result;
    })();

    const paginatedUsers = filteredAndSortedUsers.slice(
        (selectedPage - 1) * itemsPerPage,
        selectedPage * itemsPerPage
    );

    const totalItems = filteredAndSortedUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    useEffect(() => {
        setSelectedPage(1);
    }, [searchTerm, filterRole, filterStatus, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setSelectedPage(page);
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const toggleRoleFilter = (role: string) => {
        setFilterRole(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const toggleStatusFilter = (status: string) => {
        setFilterStatus(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemPerPage(value);
    };

    const skeletonRows = Array(itemsPerPage).fill(0);

    const uniqueRoles = Array.from(new Set(users.map(user => user.role))).filter(Boolean);
    const uniqueStatuses = Array.from(new Set(users.map(user => user.status))).filter(Boolean);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                        <p className="text-muted-foreground">Manage user accounts and permissions</p>
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>View and manage all users on the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Join Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {skeletonRows.map((_, index) => (
                                            <TableRow key={`skeleton-${index}`}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                        <div className="flex flex-col">
                                                            <Skeleton className="h-4 w-24 mb-1" />
                                                            <Skeleton className="h-3 w-32" />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">Manage user accounts and permissions</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all users on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search users..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Filter dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="ml-auto">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter
                                        {(filterRole.length > 0 || filterStatus.length > 0) && (
                                            <Badge variant="secondary" className="ml-2">
                                                {filterRole.length + filterStatus.length}
                                            </Badge>
                                        )}
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                    <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {uniqueRoles.map(role => (
                                        <DropdownMenuCheckboxItem
                                            key={role}
                                            checked={filterRole.includes(role)}
                                            onCheckedChange={() => toggleRoleFilter(role)}
                                        >
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </DropdownMenuCheckboxItem>
                                    ))}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {uniqueStatuses.map(status => (
                                        <DropdownMenuCheckboxItem
                                            key={status}
                                            checked={filterStatus.includes(status)}
                                            onCheckedChange={() => toggleStatusFilter(status)}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </DropdownMenuCheckboxItem>
                                    ))}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Items per page</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {[8, 16, 32, 64].map(count => (
                                        <DropdownMenuCheckboxItem
                                            key={count}
                                            checked={itemsPerPage === count}
                                            onCheckedChange={() => handleItemsPerPageChange(count)}
                                        >
                                            {count}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <div
                                                className="flex items-center cursor-pointer"
                                                onClick={() => handleSort("name")}
                                            >
                                                User
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                                {sortField === "name" && (
                                                    <span className="ml-1 text-xs">
                                                        ({sortDirection})
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div
                                                className="flex items-center cursor-pointer"
                                                onClick={() => handleSort("role")}
                                            >
                                                Role
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                                {sortField === "role" && (
                                                    <span className="ml-1 text-xs">
                                                        ({sortDirection})
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div
                                                className="flex items-center cursor-pointer"
                                                onClick={() => handleSort("status")}
                                            >
                                                Status
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                                {sortField === "status" && (
                                                    <span className="ml-1 text-xs">
                                                        ({sortDirection})
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div
                                                className="flex items-center cursor-pointer"
                                                onClick={() => handleSort("joinDate")}
                                            >
                                                Join Date
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                                {sortField === "joinDate" && (
                                                    <span className="ml-1 text-xs">
                                                        ({sortDirection})
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {error ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-red-500">
                                                Error loading users. Please try again.
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={user.avatar} alt={user.name} />
                                                            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{user.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {user.username}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getRoleBadge(user.role.toLowerCase())}</TableCell>
                                                <TableCell>{getStatusBadge(user.status)}</TableCell>
                                                <TableCell>{user.createdAt}</TableCell>
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
                                                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing {totalItems > 0 ? (selectedPage - 1) * itemsPerPage + 1 : 0}-
                                {Math.min(selectedPage * itemsPerPage, totalItems)} of {totalItems} users
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(selectedPage - 1)}
                                    disabled={selectedPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === selectedPage ? "default" : "outline"}
                                            size="icon"
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                {totalPages > 5 && selectedPage < totalPages - 2 && <span className="mx-1">...</span>}
                                {totalPages > 5 && selectedPage < totalPages - 1 && (
                                    <Button
                                        variant={totalPages === selectedPage ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => handlePageChange(totalPages)}
                                    >
                                        {totalPages}
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handlePageChange(selectedPage + 1)}
                                    disabled={selectedPage === totalPages || totalPages === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default UsersPage