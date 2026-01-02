import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupApi } from '../api/groups';
import type { CreateGroupRequest } from '../api/types';

export function useUserGroups(userId?: number) {
    return useQuery({
        queryKey: ['groups', 'user', userId],
        queryFn: () => groupApi.getUserGroups(userId!),
        enabled: !!userId,
    });
}

export function useGroup(groupId?: number) {
    return useQuery({
        queryKey: ['group', groupId],
        queryFn: () => groupApi.getById(groupId!),
        enabled: !!groupId,
    });
}

export function useGroupMembers(groupId?: number) {
    return useQuery({
        queryKey: ['group', groupId, 'members'],
        queryFn: () => groupApi.getMembers(groupId!),
        enabled: !!groupId,
    });
}

export function useCreateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateGroupRequest) => groupApi.create(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['groups', 'user', variables.createdBy] });
        },
    });
}

export function useUpdateGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CreateGroupRequest }) => groupApi.update(id, data),
        onSuccess: (group) => {
            queryClient.invalidateQueries({ queryKey: ['group', group.id] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    });
}

export function useDeleteGroup() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => groupApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
    });
}

export function useAddGroupMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, userId, requestingUserId }: { groupId: number; userId: number; requestingUserId: number }) =>
            groupApi.addMember(groupId, userId, requestingUserId),
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['group', groupId, 'members'] });
        },
    });
}

export function useRemoveGroupMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ groupId, userId, requestingUserId }: { groupId: number; userId: number; requestingUserId: number }) =>
            groupApi.removeMember(groupId, userId, requestingUserId),
        onSuccess: (_, { groupId }) => {
            queryClient.invalidateQueries({ queryKey: ['group', groupId, 'members'] });
        },
    });
}
