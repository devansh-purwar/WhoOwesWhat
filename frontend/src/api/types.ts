// TypeScript types matching backend DTOs

export const SplitType = {
    EQUAL: 'EQUAL',
    EXACT: 'EXACT',
    PERCENTAGE: 'PERCENTAGE',
    SHARES: 'SHARES'
} as const;

export type SplitType = typeof SplitType[keyof typeof SplitType];

export const CategoryType = {
    FOOD: 'FOOD',
    TRAVEL: 'TRAVEL',
    RENT: 'RENT',
    UTILITIES: 'UTILITIES',
    ENTERTAINMENT: 'ENTERTAINMENT',
    SHOPPING: 'SHOPPING',
    HEALTHCARE: 'HEALTHCARE',
    EDUCATION: 'EDUCATION',
    OTHER: 'OTHER'
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

export const GroupRole = {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER'
} as const;

export type GroupRole = typeof GroupRole[keyof typeof GroupRole];

export interface User {
    id: number;
    email: string;
    phone?: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface Group {
    id: number;
    name: string;
    description?: string;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
}

export interface GroupMember {
    id: number;
    groupId: number;
    userId: number;
    role: GroupRole;
    joinedAt: string;
}

export interface Expense {
    id: number;
    amount: number;
    description: string;
    category: CategoryType;
    currency: string;
    paidBy: number;
    groupId?: number;
    splitType: SplitType;
    expenseDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseSplit {
    id: number;
    expenseId: number;
    userId: number;
    amount?: number;
    percentage?: number;
    shares?: number;
}

export interface Balance {
    id: number;
    fromUserId: number;
    toUserId: number;
    groupId?: number;
    amount: number;
    currency: string;
    updatedAt: string;
}

export interface Settlement {
    id: number;
    fromUserId: number;
    toUserId: number;
    groupId?: number;
    amount: number;
    currency: string;
    settledAt: string;
}

// Request types
export interface RegisterUserRequest {
    email: string;
    phone?: string;
    password: string;
    name: string;
}

export interface CreateGroupRequest {
    name: string;
    description?: string;
    createdBy: number;
}

export interface SplitParticipant {
    userId: number;
    amount?: number;
    percentage?: number;
    shares?: number;
}

export interface CreateExpenseRequest {
    amount: number;
    description: string;
    category: CategoryType;
    currency: string;
    paidBy: number;
    groupId?: number;
    splitType: SplitType;
    participants: SplitParticipant[];
    expenseDate?: string;
}
