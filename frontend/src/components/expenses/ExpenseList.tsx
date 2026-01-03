import { useState } from 'react';
import type { Expense, GroupMember } from '@/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Receipt, User as UserIcon, Edit, Trash2 } from 'lucide-react';
import { EditExpenseDialog } from './EditExpenseDialog';
import { useDeleteExpense } from '@/hooks/useExpenses';

interface ExpenseListProps {
    expenses: Expense[];
    members?: GroupMember[];
}

export function ExpenseList({ expenses, members }: ExpenseListProps) {
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const deleteExpenseMutation = useDeleteExpense();
    const currentUserId = parseInt(localStorage.getItem('userId') || '0');

    const handleEditClick = (expense: Expense) => {
        setEditingExpense(expense);
        setEditDialogOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
            try {
                await deleteExpenseMutation.mutateAsync(id);
            } catch (error: any) {
                console.error('Failed to delete expense:', error);
                const message = error.response?.data?.message || 'Failed to delete expense. You might not have permission.';
                alert(message);
            }
        }
    };

    const getPayerName = (userId: number) => {
        if (userId === currentUserId) return 'You';
        // Debug logs if members are empty or user not found
        if (!members || members.length === 0) {
            console.log('ExpenseList: No members data available');
            return `User #${userId}`;
        }
        const member = members?.find(m => m.userId === userId);
        if (!member) console.log(`ExpenseList: Member not found for userId ${userId} in`, members);

        return member && member.userName && member.userName !== 'Unknown' ? member.userName : `User #${userId}`;
    };

    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">No expenses found in this group.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {expenses.map((expense) => (
                    <Card key={expense.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Receipt className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-lg">{expense.description}</h4>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <Badge variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0">
                                            {expense.category}
                                        </Badge>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 text-xs">
                                            <UserIcon className="h-3 w-3" />
                                            Paid by {getPayerName(expense.paidBy)}
                                        </span>
                                        <span>•</span>
                                        <span className="text-xs">
                                            {format(new Date(expense.expenseDate), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="text-right mr-3">
                                    <div className="text-xl font-bold text-foreground">
                                        {expense.currency} {expense.amount.toFixed(2)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight mt-0.5">
                                        Split: {expense.splitType}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditClick(expense)}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(expense.id)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <EditExpenseDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                expense={editingExpense}
            />
        </>
    );
}
