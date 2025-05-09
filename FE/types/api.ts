export interface Response<T> {
    data: T;
    message: number;
    statusCode: number;
    isSuccess: boolean;
}

export interface ErrorResponse {
    message: number;
    statusCode: number;
    isSuccess: boolean;
}

interface QueryParams {
    sortBy?: string | null;
    sortDirection?: "asc" | "desc" | null;
    pageNumber?: number | null;
    pageSize?: number | null;
}

export interface GetSongListParams extends QueryParams {
    titleContains?: string | null;
    genre?: string | null;
    minDuration?: string | null; // ISO string, e.g., "00:03:00"
    maxDuration?: string | null;
    releaseAfter?: string | null;  // ISO 8601 string, e.g., "2023-01-01"
    releaseBefore?: string | null;
}

export interface GetUserListParams extends QueryParams {
    isActive?: boolean | null;
    isBanned?: boolean | null;
    name?: string | null;
    address?: string | null;
    genre?: "Male" | "Female" | "Other" | null;
    isArtist?: boolean | null;
}

export interface GetPlaylistsParams extends QueryParams {
    keyword?: string | null;
    isPublic?: boolean | null;
}

export interface GetAlbumsParams extends QueryParams {
    keyword?: string | null;
    byArtist?: string | null;
    minReleaseDate?: string | null; // "YYYY-MM-DD"
    maxReleaseDate?: string | null;
    minStreams?: number | null;
    maxStreams?: number | null;
}

export interface PaymentResponse {
    clientSecret?: string | null;
    paymentUrl?: string | null;
    transactionId?: string | null;
}

export interface PaymentRequest {
    amount: number;
    currency: string;
    paymentMethod: string;
    userId: string;
}