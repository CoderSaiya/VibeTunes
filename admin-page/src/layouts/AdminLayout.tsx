"use client"

import { Outlet } from "react-router-dom"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Sidebar from "../components/sidebar/SideBar.tsx"
import Header from "../components/header/Header"
import { useMediaQuery } from "../hooks/use-media-query"
import { SidebarProvider } from "../components/ui/sidebar"

const AdminLayout = () => {
    const location = useLocation()
    const isMobile = useMediaQuery("(max-width: 768px)")
    const [defaultOpen, setDefaultOpen] = useState(true)

    useEffect(() => {
        // Close sidebar on mobile when route changes
        if (isMobile) {
            setDefaultOpen(false)
        }
    }, [location.pathname, isMobile])

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default AdminLayout