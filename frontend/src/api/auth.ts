import { apiClient } from './client';

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
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
    }
};

export default authApi;
