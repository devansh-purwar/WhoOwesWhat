import { apiClient } from './client';
import type { Group, GroupMember, CreateGroupRequest } from './types';

export const groupApi = {
    create: async (data: CreateGroupRequest): Promise<Group> => {
        const response = await apiClient.post<Group>('/groups', data);
        return response.data;
    },

    getById: async (id: number): Promise<Group> => {
        const response = await apiClient.get<Group>(`/groups/${id}`);
        return response.data;
    },

    getUserGroups: async (userId: number): Promise<Group[]> => {
        const response = await apiClient.get<Group[]>(`/groups/user/${userId}`);
        return response.data;
    },

    getMembers: async (groupId: number): Promise<GroupMember[]> => {
        const response = await apiClient.get<GroupMember[]>(`/groups/${groupId}/members`);
        return response.data;
    },

    addMember: async (groupId: number, userId: number, requestingUserId: number): Promise<void> => {
        await apiClient.post(`/groups/${groupId}/members/${userId}?requestingUserId=${requestingUserId}`);
    },

    removeMember: async (groupId: number, userId: number, requestingUserId: number): Promise<void> => {
        await apiClient.delete(`/groups/${groupId}/members/${userId}?requestingUserId=${requestingUserId}`);
    },

    update: async (id: number, data: CreateGroupRequest): Promise<Group> => {
        const response = await apiClient.put<Group>(`/groups/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/groups/${id}`);
    },
};
