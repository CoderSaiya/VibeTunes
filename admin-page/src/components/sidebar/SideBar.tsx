"use client"

import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, Music, Disc, ListMusic, PlaySquare, Settings, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import {
    Sidebar as ShadcnSidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
} from "../../components/ui/sidebar"

const Sidebar = () => {
    const location = useLocation()
    const { user, logout } = useAuth()

    const isActive = (path: string) => location.pathname === path

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/users", label: "Users", icon: Users },
        { path: "/artists", label: "Artists", icon: Music },
        { path: "/albums", label: "Albums", icon: Disc },
        { path: "/tracks", label: "Tracks", icon: ListMusic },
        { path: "/playlists", label: "Playlists", icon: PlaySquare },
        { path: "/setting", label: "Setting", icon: Settings },
    ]

    return (
        <ShadcnSidebar>
            <SidebarHeader className="flex h-14 items-center border-b px-4">
                <div className="flex items-center gap-2">
                    <Music className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">VibeTunes Admin</span>
                </div>
                <div className="ml-auto md:hidden">
                    <SidebarTrigger />
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {navItems.map((item) => (
                        <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton asChild isActive={isActive(item.path)} tooltip={item.label}>
                                <Link to={item.path}>
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="ml-auto rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </SidebarFooter>
        </ShadcnSidebar>
    )
}

export default Sidebar