import { apiClient } from './client';
import type { Expense, ExpenseSplit, CreateExpenseRequest, UpdateExpenseRequest } from './types';

export const expenseApi = {
    create: async (data: CreateExpenseRequest): Promise<Expense> => {
        const response = await apiClient.post<Expense>('/expenses', data);
        return response.data;
    },

    update: async (id: number, data: UpdateExpenseRequest): Promise<Expense> => {
        const response = await apiClient.put<Expense>(`/expenses/${id}`, data);
        return response.data;
    },


    getById: async (id: number): Promise<Expense> => {
        const response = await apiClient.get<Expense>(`/expenses/${id}`);
        return response.data;
    },

    getGroupExpenses: async (groupId: number): Promise<Expense[]> => {
        const response = await apiClient.get<Expense[]>(`/expenses/group/${groupId}`);
        return response.data;
    },

    getPersonalExpenses: async (userId: number): Promise<Expense[]> => {
        const response = await apiClient.get<Expense[]>(`/expenses/personal/${userId}`);
        return response.data;
    },

    getSplits: async (id: number): Promise<ExpenseSplit[]> => {
        const response = await apiClient.get<ExpenseSplit[]>(`/expenses/${id}/splits`);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/expenses/${id}`);
    },
};
