import { useState, useEffect } from 'react';
import { useGroupMembers } from '@/hooks/useGroups';
import { useUpdateExpense, useExpenseSplits } from '@/hooks/useExpenses';
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
import type { Expense } from '@/api/types';

interface EditExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expense: Expense | null;
}

interface ParticipantSplit {
    userId: number;
    amount?: number;
    percentage?: number;
    shares?: number;
}

export function EditExpenseDialog({ open, onOpenChange, expense }: EditExpenseDialogProps) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<CategoryType>(CategoryType.OTHER);
    const [splitType, setSplitType] = useState<SplitType>(SplitType.EQUAL);
    const [participantSplits, setParticipantSplits] = useState<ParticipantSplit[]>([]);

    const { data: members } = useGroupMembers(expense?.groupId);
    const { data: existingSplits } = useExpenseSplits(expense?.id);
    const updateExpenseMutation = useUpdateExpense();

    // Initialize form when expense changes
    useEffect(() => {
        if (expense) {
            setAmount(expense.amount.toString());
            setDescription(expense.description);
            setCategory(expense.category);
            setSplitType(expense.splitType);
        }
    }, [expense]);

    // Initialize participant splits when members change
    useEffect(() => {
        if (members && members.length > 0) {
            // If we have existing splits, map them to the participants
            const initialSplits = members.map(m => {
                const existingSplit = existingSplits?.find(s => s.userId === m.userId);
                return {
                    userId: m.userId,
                    amount: existingSplit?.amount,
                    percentage: existingSplit?.percentage,
                    shares: existingSplit?.shares ?? 1,
                };
            });
            setParticipantSplits(initialSplits);
        }
    }, [members, existingSplits]);

    const updateParticipantSplit = (userId: number, field: 'amount' | 'percentage' | 'shares', value: number) => {
        setParticipantSplits(prev =>
            prev.map(p => (p.userId === userId ? { ...p, [field]: value } : p))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expense || !members || members.length === 0) return;

        try {
            const participants = participantSplits.map(p => {
                const participant: any = { userId: p.userId };

                if (splitType === SplitType.EXACT && p.amount !== undefined) {
                    participant.amount = p.amount;
                } else if (splitType === SplitType.PERCENTAGE && p.percentage !== undefined) {
                    participant.percentage = p.percentage;
                } else if (splitType === SplitType.SHARES && p.shares !== undefined) {
                    participant.shares = p.shares;
                }

                return participant;
            });

            await updateExpenseMutation.mutateAsync({
                id: expense.id,
                data: {
                    amount: parseFloat(amount),
                    description,
                    category,
                    splitType,
                    participants,
                },
            });

            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update expense:', error);
        }
    };

    const getMemberName = (userId: number) => {
        const member = members?.find(m => m.userId === userId);
        return member ? (member.userName && member.userName !== 'Unknown' ? member.userName : `User ${userId}`) : `User ${userId}`;
    };

    if (!expense) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                    <DialogDescription>
                        Update expense details and split configuration.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
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
                        <div className="grid gap-2">
                            <Label htmlFor="splitType">Split Type</Label>
                            <Select value={splitType} onValueChange={(v) => setSplitType(v as SplitType)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select split type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={SplitType.EQUAL}>Equal Split</SelectItem>
                                    <SelectItem value={SplitType.EXACT}>Exact Amounts</SelectItem>
                                    <SelectItem value={SplitType.PERCENTAGE}>By Percentage</SelectItem>
                                    <SelectItem value={SplitType.SHARES}>By Shares</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Participant-specific inputs based on split type */}
                        {splitType !== SplitType.EQUAL && members && members.length > 0 && (
                            <div className="grid gap-2">
                                <Label>Participant Splits</Label>
                                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                                    {participantSplits.map((participant) => (
                                        <div key={participant.userId} className="flex items-center gap-2">
                                            <span className="text-sm flex-1">{getMemberName(participant.userId)}</span>
                                            {splitType === SplitType.EXACT && (
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Amount"
                                                    className="w-24"
                                                    value={participant.amount || ''}
                                                    onChange={(e) =>
                                                        updateParticipantSplit(
                                                            participant.userId,
                                                            'amount',
                                                            parseFloat(e.target.value) || 0
                                                        )
                                                    }
                                                />
                                            )}
                                            {splitType === SplitType.PERCENTAGE && (
                                                <div className="flex items-center gap-1">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="%"
                                                        className="w-20"
                                                        value={participant.percentage || ''}
                                                        onChange={(e) =>
                                                            updateParticipantSplit(
                                                                participant.userId,
                                                                'percentage',
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                    />
                                                    <span className="text-sm">%</span>
                                                </div>
                                            )}
                                            {splitType === SplitType.SHARES && (
                                                <Input
                                                    type="number"
                                                    step="1"
                                                    placeholder="Shares"
                                                    className="w-20"
                                                    value={participant.shares || 1}
                                                    onChange={(e) =>
                                                        updateParticipantSplit(
                                                            participant.userId,
                                                            'shares',
                                                            parseInt(e.target.value) || 1
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateExpenseMutation.isPending}>
                            {updateExpenseMutation.isPending ? 'Updating...' : 'Update Expense'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
