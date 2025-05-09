import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {AuthState} from "@/types/auth";
import {jwtDecode} from "jwt-decode";

const initialState: AuthState = {
    accessToken: null,
    refreshToken: null,
    userId: null,
    role: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ accessToken: string; refreshToken: string }>
        ) => {
            const { accessToken, refreshToken } = action.payload;
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;

            const decode : any = jwtDecode(accessToken);
            const userId = decode["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
            const role = decode["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

            state.userId = userId;
            state.role = role

            console.log("setCredentials:" + userId)

            // Lưu vào AsyncStorage
            AsyncStorage.setItem("accessToken", accessToken);
            AsyncStorage.setItem("refreshToken", refreshToken);
            AsyncStorage.setItem("userId", userId);
            AsyncStorage.setItem("role", role);
        },
        updateAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            AsyncStorage.setItem("accessToken", action.payload);
        },
        logout: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.userId = null;
            state.role = null;

            // Xóa khỏi AsyncStorage
            AsyncStorage.removeItem("accessToken");
            AsyncStorage.removeItem("refreshToken");
            AsyncStorage.removeItem("userId");
            AsyncStorage.removeItem("role");
        },
    },
});