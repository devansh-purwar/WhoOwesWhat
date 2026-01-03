import { apiClient } from './client';
import type { RegisterUserRequest } from './types';

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    id: number;
    email: string;
    name: string;
    message: string;
    token?: string;
}

export interface AuthResponse {
    message: string;
    token?: string;
}

export const authApi = {
    forgotPassword: async (data: ForgotPasswordRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/forgot-password', data);
        return response.data;
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/reset-password', data);
        return response.data;
    },

    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterUserRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/register', data);
        return response.data;
    }
};

export default authApi;
