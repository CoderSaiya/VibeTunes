"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useDispatch, useSelector } from "react-redux"
import { setCredentials, logout } from "@/store/api"
import type { RootState } from "@/store"
import {UserRole} from "@/types/auth";

interface AuthContextType {
    isAuthenticated: boolean
    isLoading: boolean
    userId: string | null
    role: string | null
    login: (accessToken: string, refreshToken: string) => void
    logout: () => void
    hasRole: (roles: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
    role: null,
    login: () => {},
    logout: () => {},
    hasRole: () => false,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true)
    const dispatch = useDispatch()
    const { accessToken, userId, role } = useSelector((state: RootState) => state.auth)

    useEffect(() => {
        // Check for authentication status on app load
        const checkAuth = async () => {
            try {
                const storedAccessToken = await AsyncStorage.getItem("accessToken")
                const storedRefreshToken = await AsyncStorage.getItem("refreshToken")

                if (storedAccessToken && storedRefreshToken) {
                    // Restore auth state
                    dispatch(
                        setCredentials({
                            accessToken: storedAccessToken,
                            refreshToken: storedRefreshToken,
                        }),
                    )
                }
            } catch (error) {
                console.error("Error checking auth:", error)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [dispatch])

    const loginHandler = (accessToken: string, refreshToken: string) => {
        console.log("ABC@@" + accessToken)
        dispatch(
            setCredentials({
                accessToken,
                refreshToken,
            }),
        )
    }

    const logoutHandler = () => {
        dispatch(logout())
    }

    // Kiểm tra xem người dùng có role được yêu cầu không
    const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
        if (!userId || !role) return false

        // @ts-ignore
        return requiredRoles.includes(role.toLowerCase());
    }

    const value = {
        isAuthenticated: !!accessToken,
        isLoading,
        userId,
        role,
        login: loginHandler,
        logout: logoutHandler,
        hasRole,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}