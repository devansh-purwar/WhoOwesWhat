import { apiClient } from './client';
import type { Balance, Settlement } from './types';

export const balanceApi = {
    getUserBalances: async (userId: number): Promise<Balance[]> => {
        const response = await apiClient.get<Balance[]>(`/balances/user/${userId}`);
        return response.data;
    },

    getUserNetBalance: async (userId: number): Promise<Record<string, number>> => {
        const response = await apiClient.get<Record<string, number>>(`/balances/user/${userId}/net`);
        return response.data;
    },

    getGroupBalances: async (groupId: number): Promise<Balance[]> => {
        const response = await apiClient.get<Balance[]>(`/balances/group/${groupId}`);
        return response.data;
    },

    settle: async (
        fromUserId: number,
        toUserId: number,
        amount: number,
        currency: string,
        groupId?: number
    ): Promise<Settlement> => {
        const params = new URLSearchParams({
            fromUserId: fromUserId.toString(),
            toUserId: toUserId.toString(),
            amount: amount.toString(),
            currency,
        });
        if (groupId) {
            params.append('groupId', groupId.toString());
        }
        const response = await apiClient.post<Settlement>(`/balances/settle?${params}`);
        return response.data;
    },

    getUserSettlements: async (userId: number): Promise<Settlement[]> => {
        const response = await apiClient.get<Settlement[]>(`/balances/settlements/user/${userId}`);
        return response.data;
    },
};
