import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/users';
import type { RegisterUserRequest } from '../api/types';
import authApi from '../api/auth';
import { authService } from '../services/authService';

export function useUser(userId?: number) {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => userApi.getById(userId!),
        enabled: !!userId,
    });
}

export function useRegisterUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: RegisterUserRequest) => authApi.register(data),
        onSuccess: (response) => {
            // Save token and user info using authService
            if (response.token) {
                authService.saveToken(response.token);
                authService.saveUser({
                    id: response.id,
                    email: response.email,
                    name: response.name
                });
            }
            queryClient.setQueryData(['user', response.id], response);
        },
    });
}

export function useCurrentUser() {
    const userId = localStorage.getItem('userId');
    return useUser(userId ? parseInt(userId) : undefined);
}

export function useSearchUsers(query: string) {
    return useQuery({
        queryKey: ['users', 'search', query],
        queryFn: () => userApi.search(query),
        enabled: query.length >= 2,
    });
}
