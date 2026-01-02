import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/users';
import type { RegisterUserRequest } from '../api/types';

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
        mutationFn: (data: RegisterUserRequest) => userApi.register(data),
        onSuccess: (user) => {
            queryClient.setQueryData(['user', user.id], user);
            localStorage.setItem('userId', user.id.toString());
            localStorage.setItem('userName', user.name);
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
