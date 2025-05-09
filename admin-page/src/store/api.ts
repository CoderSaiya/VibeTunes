import {BaseQueryArg, createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import type { RootState } from ".";
import {authSlice} from "@/store/authSlice";
import {TokenResponse} from "@/types/auth";
import {Song} from "@/types/song";
import {GetAlbumsParams, GetPlaylistsParams, GetSongListParams, GetUserListParams} from "@/types/api";
import {Response} from "@/types/api"
import {Artist, Profile, User} from "@/types/user";
import {Playlist} from "@/types/playlist";
import {Album} from "@/types/album";

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
    tagTypes: ["User", "Room", "Song", "Playlist"],
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
        }),

        // updateProfile: builder.mutation<Response<Profile>, string>({
        //     query: (userId) => ({
        //         url: `/users/profile/${userId}`,
        //         method: "PUT",
        //     }),
        //     invalidatesTags: ["User"],
        // }),

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
            providesTags: ["Song"],
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
    useGetProfileQuery,
    // useUpdateProfileMutation,
    useGetRoomsQuery,
    useCreateRoomMutation,
    useGetRoomQuery,
    useJoinRoomMutation,
    useLeaveRoomMutation,
    useGetSongListQuery,
    useGetUserListQuery,
    useGetPlaylistsQuery,
    useGetAlbumsQuery,
} = api;