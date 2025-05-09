import {BaseQueryArg, createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type { RootState } from ".";
import {authSlice} from "@/store/authSlice";
import {TokenResponse} from "@/types/auth";
import {Song} from "@/types/song";
import {
    GetAlbumsParams,
    GetPlaylistsParams,
    GetSongListParams,
    GetUserListParams,
    PaymentRequest,
    PaymentResponse
} from "@/types/api";
import {Response} from "@/types/api"
import {Artist, ArtistProfile, Profile, User} from "@/types/user";
import {Playlist} from "@/types/playlist";
import {Album} from "@/types/album";
import {CreateSongRequest, Genre} from "@/types/upload";
import {UpdateProfileRequest} from "@/types/profile";

export const { setCredentials, updateAccessToken, logout } = authSlice.actions;

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Tạo API với base query
const baseQuery = fetchBaseQuery({
    baseUrl: `${BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
        // Lấy token từ state
        const token = (getState() as RootState).auth.accessToken;

        // Nếu có token, thêm nó vào header
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }

        return headers;
    },
});

// Tạo một base query tùy chỉnh với tính năng tự động refresh token
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    console.log("[Request URL]:", args.url);
    console.log("[Request Method]:", args.method);
    console.log("[Request Body]:", args.body);

    // Thử thực hiện truy vấn ban đầu
    let result = await baseQuery(args, api, extraOptions);
    console.log("[Response URL]:", result);

    // Nếu nhận được lỗi 401 (Unauthorized)
    if (result.error && result.error.status === 401) {
        console.log("Token hết hạn, thử refresh...");

        // Lấy refresh token từ state
        const refreshToken = (api.getState() as RootState).auth.refreshToken;

        if (!refreshToken) {
            console.log("Không có refresh token");
            // Thực hiện logout nếu không có refresh token
            api.dispatch(logout());
            return result;
        }

        // Gửi yêu cầu lấy token mới
        const refreshResult = await baseQuery(
            {
                url: "/Auth/refresh",
                method: "POST",
                body: { refreshToken },
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            // Lưu token mới
            const { accessToken } = refreshResult.data as TokenResponse;
            api.dispatch(updateAccessToken(accessToken));

            // Thử lại truy vấn ban đầu với token mới
            result = await baseQuery(args, api, extraOptions);
        } else {
            // Nếu refresh thất bại, logout người dùng
            console.log("Refresh token thất bại, thực hiện logout");
            api.dispatch(logout());
        }
    }

    return result;
};

// Định nghĩa API
export const api = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User", "Room", "Song", "Playlist", "Payment", "Album", "Genre"],
    endpoints: (builder) => ({
        // Các endpoint xác thực
        login: builder.mutation<Response<TokenResponse>, { email: string; password: string }>({
            query: (credentials) => ({
                url: "/Auth/sign-in",
                method: "POST",
                body: credentials,
            }),
            // // Biến đổi kết quả trả về để cập nhật trạng thái auth
            // onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
            //     try {
            //         const { data } = await queryFulfilled;
            //         const token = data.data;
            //         console.log("ATS: " + token.accessToken)
            //         dispatch(
            //             setCredentials({
            //                 accessToken: token.accessToken,
            //                 refreshToken: token.refreshToken,
            //             })
            //         );
            //     } catch (error) {
            //         // Xử lý lỗi nếu cần
            //     }
            // },
        }),

        googleLogin: builder.mutation<Response<TokenResponse>, { idToken: string; }>({
            query: (credentials) => ({
                url: "/Auth/google",
                method: "POST",
                body: credentials,
            }),
            // // Biến đổi kết quả trả về để cập nhật trạng thái auth
            // onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
            //     try {
            //         const { data } = await queryFulfilled;
            //         const token = data.data;
            //         console.log("ATS: " + token.accessToken)
            //         dispatch(
            //             setCredentials({
            //                 accessToken: token.accessToken,
            //                 refreshToken: token.refreshToken,
            //             })
            //         );
            //     } catch (error) {
            //         // Xử lý lỗi nếu cần
            //     }
            // },
        }),

        register: builder.mutation<Response<string>, { firstName: string; lastName: string; email: string; password: string }>({
            query: (userData) => ({
                url: "/Auth/sign-up",
                method: "POST",
                body: userData,
            }),
        }),

        forgotPassword: builder.mutation<Response<string>, { email: string }>({
            query: (data) => ({
                url: "/Auth/forgot-password",
                method: "POST",
                body: data,
            }),
        }),

        verifyCode: builder.mutation<Response<string>, { email: string, code: string }>({
            query: (data) => ({
                url: "/Auth/verify-code",
                method: "POST",
                body: data,
            }),
        }),

        resetPassword: builder.mutation<Response<string>, { email:string; password: string }>({
            query: (data) => ({
                url: "/Auth/reset-password",
                method: "POST",
                body: data,
            }),
        }),

        changePassword: builder.mutation<Response<string>, { userId: string; oldPassword: string; newPassword: string }>({
            query: (data) => ({
                url: "/Auth/change-password",
                method: "POST",
                body: data,
            }),
        }),

        verifyEmail: builder.mutation<Response<string>, { email: string; code: string }>({
            query: (data) => ({
                url: "/Auth/verify-email",
                method: "POST",
                body: data,
            }),
        }),

        getProfile: builder.query<Response<Profile>, string>({
            query: (userId) => ({
                url: `/User/profile?UserId=${userId}`,
            }),
            providesTags: ["User"],
        }),

        getArtistProfile: builder.query<Response<ArtistProfile>, string>({
            query: (artist) => ({
                url: `/User/artist?ArtistId=${artist}`,
            }),
            providesTags: ["User"],
        }),

        followArtist: builder.mutation<Response<string>, { userId: string; artistId: string }>({
            query: (data) => ({
                url: "/User/follow",
                method: "POST",
                body: data,
            }),
        }),

        updateProfile: builder.mutation<Response<string>, UpdateProfileRequest>({
            query: (data) => {
                const formData = new FormData();

                formData.append("UserId", data.id);

                if (data.firstName != null && data.firstName !== "") {
                    formData.append("FirstName", data.firstName);
                }

                if (data.lastName != null && data.lastName !== "") {
                    formData.append("LastName", data.lastName);
                }

                if (data.address != null && data.address !== "") {
                    formData.append("Address", data.address);
                }

                if (data.gender != null && data.gender !== "") {
                    formData.append("Gender", data.gender);
                }

                // Fix for avatar handling
                if (data.avatar && data.avatar.uri && data.avatar.uri.trim() !== '') {
                    // Get the file extension from the URI
                    const uriParts = data.avatar.uri.split('.');
                    const fileType = uriParts[uriParts.length - 1];

                    // Determine MIME type based on file extension
                    const mimeType = fileType === 'jpg' || fileType === 'jpeg'
                        ? 'image/jpeg'
                        : fileType === 'png'
                            ? 'image/png'
                            : 'image/jpeg';

                    const fileName = data.avatar.fileName || `image.${fileType}`;

                    formData.append("Avatar", {
                        uri: data.avatar.uri,
                        name: fileName,
                        type: mimeType
                    } as any);

                    console.log("Image being appended:", {
                        uri: data.avatar.uri,
                        name: fileName,
                        type: mimeType
                    });
                }

                return {
                    url: "/User/profile",
                    method: "PUT",
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                };
            },
            invalidatesTags: ["User"],
        }),

        // Các endpoint liên quan đến room
        getRooms: builder.query<any[], void>({
            query: () => "/rooms",
            providesTags: ["Room"],
        }),

        createRoom: builder.mutation<any, { name: string; description?: string }>({
            query: (data) => ({
                url: "/rooms",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Room"],
        }),

        getRoom: builder.query<any, string>({
            query: (id) => `/rooms/${id}`,
            providesTags: (result, error, id) => [{ type: "Room", id }],
        }),

        joinRoom: builder.mutation<any, string>({
            query: (id) => ({
                url: `/rooms/${id}/join`,
                method: "POST",
            }),
            invalidatesTags: ["Room"],
        }),

        leaveRoom: builder.mutation<any, string>({
            query: (id) => ({
                url: `/rooms/${id}/leave`,
                method: "POST",
            }),
            invalidatesTags: ["Room"],
        }),

        createSong: builder.mutation<Response<string>, CreateSongRequest>({
            query: (songData) => {
                const formData = new FormData()

                formData.append("ArtistId", songData.artistId)
                formData.append("Title", songData.title)
                formData.append('Image', {
                    uri: songData.image.uri,
                    name: songData.image.fileName || 'image.jpg',
                    type: songData.image.type || 'image/jpeg',
                } as any);

                formData.append("Audio", {
                    uri: songData.audio.uri,
                    name: songData.audio.name,
                    type: songData.audio.mimeType ||
                        "audio/mpeg",
                } as any);
                formData.append("ReleaseDate", songData.releaseDate.toISOString())
                formData.append("Genre", songData.genre)

                if (songData.albumId) {
                    formData.append("AlbumId", songData.albumId)
                }

                return {
                    url: "/Song",
                    method: "POST",
                    body: formData,
                }
            },
            invalidatesTags: ["Song"],
        }),

        getSongList: builder.query<Response<Song[]>, GetSongListParams>({
            query: (params) => {
                const mapping: Record<keyof GetSongListParams, string> = {
                    sortBy: "Filter.SortBy",
                    sortDirection: "Filter.SortDirection",
                    pageNumber: "Filter.PageNumber",
                    pageSize: "Filter.PageSize",
                    titleContains: "Filter.TitleContains",
                    genre: "Filter.Genre",
                    minDuration: "Filter.MinDuration",
                    maxDuration: "Filter.MaxDuration",
                    releaseAfter: "Filter.ReleaseAfter",
                    releaseBefore: "Filter.ReleaseBefore",
                };

                const queryParams = new URLSearchParams();

                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        // key cast sang key của GetSongListParams để tra cứu mapping
                        const mappedKey = mapping[key as keyof GetSongListParams] || key;
                        queryParams.append(mappedKey, value.toString());
                    }
                });

                return {
                    url: `/Song?${queryParams.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["Song"],
        }),

        getSongsByArtist: builder.query<Response<Song[]>, string>({
            query: (id) => ({
                url: `/Song/artist?ArtistId=${id}`,
                method: "GET",
            }),
            providesTags: ["Song"],
        }),

        getRecommendSong: builder.query<Response<Song[]>, string>({
            query: (id) => ({
                url: `/Song/recommend?UserId=${id}`,
                method: "GET",
            }),
            providesTags: ["Song"],
        }),

        getUserList: builder.query<Response<Artist[] | User[]>, GetUserListParams>({
            query: (params) => {
                const mapping: Record<keyof GetUserListParams, string> = {
                    sortBy: "Filter.SortBy",
                    sortDirection: "Filter.SortDirection",
                    pageNumber: "Filter.PageNumber",
                    pageSize: "Filter.PageSize",
                    isActive: "Filter.IsActive",
                    isBanned: "Filter.IsBanned",
                    name: "Filter.Name",
                    address: "Filter.Address",
                    genre: "Filter.Genre",
                    isArtist: "Filter.IsArtist",
                };

                const queryParams = new URLSearchParams();

                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        const mappedKey = mapping[key as keyof GetUserListParams] || key;
                        queryParams.append(mappedKey, value.toString());
                    }
                });

                return {
                    url: `/User?${queryParams.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["User"],
        }),

        createPlaylist: builder.mutation<{ data: string }, FormData>({
            query: (formData) => ({
                url: '/Playlist',
                method: 'POST',
                body: formData,
            }),
        }),

        getPlaylists: builder.query<Response<Playlist[]>, GetPlaylistsParams>({
            query: (params) => {
                const mapping: Record<keyof GetPlaylistsParams, string> = {
                    sortBy: "Filter.SortBy",
                    sortDirection: "Filter.SortDirection",
                    pageNumber: "Filter.PageNumber",
                    pageSize: "Filter.PageSize",
                    keyword: "Filter.Keyword",
                    isPublic: "Filter.IsPublic",
                };

                const queryParams = new URLSearchParams();

                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        const mappedKey = mapping[key as keyof GetPlaylistsParams] || key;
                        queryParams.append(mappedKey, value.toString());
                    }
                });

                return {
                    url: `/Playlist?${queryParams.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["Playlist"],
        }),

        getPlaylistById: builder.query<Response<Playlist>, string>({
            query: (id) => ({
                url: `/Playlist/${id}`,
                method: "GET",
            }),
            providesTags: ["Playlist"],
        }),

        getPlaylistByUser: builder.query<Response<Playlist[]>, string>({
            query: (id) => ({
                url: `/Playlist/user/${id}`,
                method: "GET",
            }),
            providesTags: ["Playlist"],
        }),

        deletePlaylist: builder.mutation<Response<string>, { id: string }>({
            query: ({ id }) => ({
                url: `/Playlist`,
                method: 'DELETE',
                body: { playlistId: id },
            }),
            invalidatesTags: ["Playlist"],
        }),

        getAlbums: builder.query<Response<Album[]>, GetAlbumsParams>({
            query: (params) => {
                const mapping: Record<keyof GetAlbumsParams, string> = {
                    sortBy: "Filter.SortBy",
                    sortDirection: "Filter.SortDirection",
                    pageNumber: "Filter.PageNumber",
                    pageSize: "Filter.PageSize",
                    keyword: "Filter.Keyword",
                    byArtist: "Filter.ByArtist",
                    minReleaseDate: "Filter.MinReleaseDate",
                    maxReleaseDate: "Filter.MaxReleaseDate",
                    minStreams: "Filter.MinStreams",
                    maxStreams: "Filter.MaxStreams",
                };

                const queryParams = new URLSearchParams();

                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        const mappedKey = mapping[key as keyof GetAlbumsParams] || key;
                        queryParams.append(mappedKey, value.toString());
                    }
                });

                return {
                    url: `/Album?${queryParams.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["Album"],
        }),

        getAlbumByArtist: builder.query<Response<Album[]>, string>({
            query: (id) => ({
                url: `/Album/artist?ArtistId=${id}`,
                method: "GET",
            }),
            providesTags: ["Album"],
        }),

        createPaymentIntent: builder.mutation<Response<PaymentResponse>, PaymentRequest>({
            query: (body) => ({
                url: "/Payment/create-payment-intent",
                method: "POST",
                body: body,
                headers: {
                    'Content-Type': 'application/json'
                }
            }),
            invalidatesTags: ["Payment"],
        }),

        handlerWebhook: builder.mutation<any, string>({
            query: (provider) => ({
                url: `/Payment/webhook/${provider}`,
                method: "POST",
            }),
            invalidatesTags: ["Payment"],
        }),

        getTransactionStatus: builder.query<Response<string>, string>({
            query: (id) => ({
                url: `/Payment/transaction/${id}/status`,
                method: "GET",
            }),
            providesTags: ["Payment"],
        }),

        getGenres: builder.query<Response<Genre[]>, void>({
            query: () => ({
                url: `/Genre`,
            }),
            providesTags: ["Genre"],
        }),

        logSong: builder.mutation<Response<string>, {userId: string, songId: string}>({
            query: (body) => ({
                url: `/Song/log`,
                method: "POST",
                body: body
            }),
            invalidatesTags: ["Song"],
        }),
    }),
});

// Xuất các hook sử dụng trong component
export const {
    useLoginMutation,
    useGoogleLoginMutation,
    useRegisterMutation,
    useForgotPasswordMutation,
    useVerifyCodeMutation,
    useResetPasswordMutation,
    useVerifyEmailMutation,
    useChangePasswordMutation,
    useGetProfileQuery,
    useGetArtistProfileQuery,
    useFollowArtistMutation,
    useUpdateProfileMutation,
    useGetRoomsQuery,
    useCreateRoomMutation,
    useGetRoomQuery,
    useJoinRoomMutation,
    useLeaveRoomMutation,
    useCreateSongMutation,
    useGetSongListQuery,
    useGetSongsByArtistQuery,
    useGetRecommendSongQuery,
    useGetUserListQuery,
    useCreatePlaylistMutation,
    useGetPlaylistsQuery,
    useGetPlaylistByIdQuery,
    useGetPlaylistByUserQuery,
    useDeletePlaylistMutation,
    useGetAlbumsQuery,
    useGetAlbumByArtistQuery,
    useCreatePaymentIntentMutation,
    useGetTransactionStatusQuery,
    useGetGenresQuery,
    useLogSongMutation,
} = api;