import { useState } from 'react';
import { useGroup, useUpdateGroup, useDeleteGroup } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GroupSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: number;
}

export function GroupSettingsDialog({ open, onOpenChange, groupId }: GroupSettingsDialogProps) {
    const navigate = useNavigate();
    const { data: group } = useGroup(groupId);
    const [name, setName] = useState(group?.name || '');
    const [description, setDescription] = useState(group?.description || '');

    const updateGroupMutation = useUpdateGroup();
    const deleteGroupMutation = useDeleteGroup();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateGroupMutation.mutateAsync({
                id: groupId,
                data: {
                    name,
                    description,
                    createdBy: group!.createdBy
                }
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update group:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
            return;
        }
        try {
            await deleteGroupMutation.mutateAsync(groupId);
            onOpenChange(false);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to delete group:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Group Settings</DialogTitle>
                    <DialogDescription>
                        Update group details or manage administrative options.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Group Name</Label>
                            <Input
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t space-y-4">
                        <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Danger Zone
                        </h4>
                        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
                            <AlertDescription className="text-xs">
                                Deleting this group will permanently remove all expenses and member associations.
                            </AlertDescription>
                        </Alert>
                        <Button
                            type="button"
                            variant="destructive"
                            className="w-full flex items-center justify-center gap-2"
                            onClick={handleDelete}
                            disabled={deleteGroupMutation.isPending}
                        >
                            <Trash2 className="h-4 w-4" />
                            {deleteGroupMutation.isPending ? 'Deleting...' : 'Delete Group'}
                        </Button>
                    </div>

                    <DialogFooter className="pt-4 border-t">
                        <Button type="submit" disabled={updateGroupMutation.isPending}>
                            {updateGroupMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
