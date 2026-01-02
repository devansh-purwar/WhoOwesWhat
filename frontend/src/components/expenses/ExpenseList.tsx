import type { Expense } from '@/api/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Receipt, User as UserIcon } from 'lucide-react';

interface ExpenseListProps {
    expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">No expenses found in this group.</p>
            </div>
        );
    }

    return (
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
                                        Paid by User #{expense.paidBy}
                                    </span>
                                    <span>•</span>
                                    <span className="text-xs">
                                        {format(new Date(expense.expenseDate), 'MMM d, yyyy')}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-foreground">
                                {expense.currency} {expense.amount.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight mt-0.5">
                                Split: {expense.splitType}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
