import { useState } from 'react';
import { useCreateGroup } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CreateGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: number;
}

export function CreateGroupDialog({ open, onOpenChange, userId }: CreateGroupDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const createGroupMutation = useCreateGroup();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createGroupMutation.mutateAsync({
                name,
                description,
                createdBy: userId,
            });
            setName('');
            setDescription('');
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to create group:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>
                        Create a group to start splitting expenses with friends.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Group Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Goa Trip, Apartment 101"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a brief description..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={createGroupMutation.isPending}>
                            {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
