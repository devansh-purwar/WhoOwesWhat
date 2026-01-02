import { useState } from 'react';
import { useUserGroups, useGroupMembers } from '@/hooks/useGroups';
import { useCreateExpense } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SplitType, CategoryType } from '@/api/types';

interface CreateExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: number;
}

export function CreateExpenseDialog({ open, onOpenChange, userId }: CreateExpenseDialogProps) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [groupId, setGroupId] = useState<string>('');
    const [category, setCategory] = useState<CategoryType>(CategoryType.OTHER);

    const { data: groups } = useUserGroups(userId);
    const { data: members } = useGroupMembers(groupId ? parseInt(groupId) : undefined);
    const createExpenseMutation = useCreateExpense();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!members || members.length === 0) return;

        try {
            await createExpenseMutation.mutateAsync({
                amount: parseFloat(amount),
                description,
                category,
                currency: 'INR',
                paidBy: userId,
                groupId: groupId ? parseInt(groupId) : undefined,
                splitType: SplitType.EQUAL,
                participants: members.map(m => ({ userId: m.userId })),
                expenseDate: new Date().toISOString(),
            });
            setAmount('');
            setDescription('');
            setGroupId('');
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to create expense:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                        Split an expense with your group members.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="group">Select Group</Label>
                            <Select value={groupId} onValueChange={setGroupId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {groups?.map((group) => (
                                        <SelectItem key={group.id} value={group.id.toString()}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., Dinner, Movie tickets"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (INR)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={(v) => setCategory(v as CategoryType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(CategoryType).map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={createExpenseMutation.isPending || !groupId}>
                            {createExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
