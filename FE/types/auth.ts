export interface TokenResponse {
    accessToken: string
    refreshToken: string
}

export interface AuthState {
    accessToken: string | null
    refreshToken: string | null
    userId: string | null
    role: string | null
}

export type UserRole = 'user' | 'artist' | 'admin'

export interface Permission {
    action: 'create' | 'read' | 'update' | 'delete'
    subject: 'movie' | 'comment' | 'user' | 'payment' | 'report'
}

export interface DecodeToken {
    id: string
    role: UserRole
    permissions: Permission[]
    iat: number
    exp: number
}