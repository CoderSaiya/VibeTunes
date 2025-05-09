import {ImagePickerAsset} from "expo-image-picker";

export interface UpdateProfileRequest {
    id: string;
    firstName?: string
    lastName?: string
    address?: string
    gender?: string
    avatar?: ImagePickerAsset
}

export interface UpdatePasswordRequest {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}