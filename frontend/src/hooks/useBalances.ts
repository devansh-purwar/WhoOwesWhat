import { useQuery } from '@tanstack/react-query';
import { balanceApi } from '../api/balances';

export function useUserBalances(userId?: number) {
    return useQuery({
        queryKey: ['balances', 'user', userId],
        queryFn: () => balanceApi.getUserBalances(userId!),
        enabled: !!userId,
    });
}

export function useUserNetBalance(userId?: number) {
    return useQuery({
        queryKey: ['balances', 'user', userId, 'net'],
        queryFn: () => balanceApi.getUserNetBalance(userId!),
        enabled: !!userId,
    });
}

export function useGroupBalances(groupId?: number) {
    return useQuery({
        queryKey: ['balances', 'group', groupId],
        queryFn: () => balanceApi.getGroupBalances(groupId!),
        enabled: !!groupId,
    });
}
