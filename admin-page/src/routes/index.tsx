"use client"

import { Navigate, Route, Routes } from "react-router-dom"
import { Suspense, lazy } from "react"
import AdminLayout from "../layouts/AdminLayout"
import LoadingScreen from "../components/LoadingScreen"
import { useAuth } from "../context/AuthContext"

// Lazy load pages
const LoginPage = lazy(() => import("../pages/auth/LoginPage"))
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"))
const UsersPage = lazy(() => import("../pages/users/UsersPage"))
const ArtistsPage = lazy(() => import("../pages/artists/ArtistsPage"))
const AlbumsPage = lazy(() => import("../pages/albums/AlbumsPage"))
const TracksPage = lazy(() => import("../pages/tracks/TracksPage"))
const PlaylistsPage = lazy(() => import("../pages/playlists/PlaylistsPage"))
const SettingPage = lazy(() => import("../pages/setting/SettingPage"))
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"))

const AppRoutes = () => {
    const { isAuthenticated } = useAuth()

    return (
        <Suspense fallback={<LoadingScreen />}>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />

                {/* Protected routes */}
                <Route path="/" element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="artists" element={<ArtistsPage />} />
                    <Route path="albums" element={<AlbumsPage />} />
                    <Route path="tracks" element={<TracksPage />} />
                    <Route path="playlists" element={<PlaylistsPage />} />
                    <Route path="setting" element={<SettingPage />} />
                </Route>

                {/* 404 route */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    )
}

export default AppRoutes