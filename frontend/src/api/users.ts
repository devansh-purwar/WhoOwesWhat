import { apiClient } from './client';
import type { User, RegisterUserRequest } from './types';

export const userApi = {
    register: async (data: RegisterUserRequest): Promise<User> => {
        const response = await apiClient.post<User>('/users/register', data);
        return response.data;
    },

    getById: async (id: number): Promise<User> => {
        const response = await apiClient.get<User>(`/users/${id}`);
        return response.data;
    },

    getByEmail: async (email: string): Promise<User> => {
        const response = await apiClient.get<User>(`/users/email/${email}`);
        return response.data;
    },

    search: async (query: string): Promise<User[]> => {
        const response = await apiClient.get<User[]>(`/users/search?query=${query}`);
        return response.data;
    },
};
