import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '../api/expenses';
import type { CreateExpenseRequest, UpdateExpenseRequest } from '../api/types';

export function useGroupExpenses(groupId?: number) {
    return useQuery({
        queryKey: ['expenses', 'group', groupId],
        queryFn: () => expenseApi.getGroupExpenses(groupId!),
        enabled: !!groupId,
    });
}

export function usePersonalExpenses(userId?: number) {
    return useQuery({
        queryKey: ['expenses', 'personal', userId],
        queryFn: () => expenseApi.getPersonalExpenses(userId!),
        enabled: !!userId,
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateExpenseRequest) => expenseApi.create(data),
        onSuccess: (expense) => {
            if (expense.groupId) {
                queryClient.invalidateQueries({ queryKey: ['expenses', 'group', expense.groupId] });
                queryClient.invalidateQueries({ queryKey: ['balances', 'group', expense.groupId] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['expenses', 'personal', expense.paidBy] });
            }
            queryClient.invalidateQueries({ queryKey: ['balances', 'user', expense.paidBy] });
        },
    });
}

export function useUpdateExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateExpenseRequest }) =>
            expenseApi.update(id, data),
        onSuccess: (expense) => {
            if (expense.groupId) {
                queryClient.invalidateQueries({ queryKey: ['expenses', 'group', expense.groupId] });
                queryClient.invalidateQueries({ queryKey: ['balances', 'group', expense.groupId] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['expenses', 'personal', expense.paidBy] });
            }
            queryClient.invalidateQueries({ queryKey: ['balances', 'user', expense.paidBy] });
        },
    });
}

export function useDeleteExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => expenseApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['balances'] });
        },
    });
}

export function useExpenseSplits(expenseId?: number) {
    return useQuery({
        queryKey: ['expense', expenseId, 'splits'],
        queryFn: () => expenseApi.getSplits(expenseId!),
        enabled: !!expenseId,
    });
}
