import { useState } from 'react';
import { useGroupMembers, useAddGroupMember, useRemoveGroupMember } from '@/hooks/useGroups';
import { useSearchUsers } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { UserPlus, UserMinus, Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ManageMembersDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: number;
    currentUserId: number;
}

export function ManageMembersDialog({ open, onOpenChange, groupId, currentUserId }: ManageMembersDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: members } = useGroupMembers(groupId);
    const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);

    const addMemberMutation = useAddGroupMember();
    const removeMemberMutation = useRemoveGroupMember();

    const handleAddMember = async (userId: number) => {
        try {
            await addMemberMutation.mutateAsync({
                groupId,
                userId,
                requestingUserId: currentUserId
            });
            setSearchQuery('');
        } catch (error) {
            console.error('Failed to add member:', error);
        }
    };

    const handleRemoveMember = async (userId: number) => {
        if (userId === currentUserId) {
            if (!window.confirm('Are you sure you want to leave this group?')) return;
        }
        try {
            await removeMemberMutation.mutateAsync({
                groupId,
                userId,
                requestingUserId: currentUserId
            });
        } catch (error) {
            console.error('Failed to remove member:', error);
        }
    };

    const isMember = (userId: number) => members?.some(m => m.userId === userId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Manage Members</DialogTitle>
                    <DialogDescription>
                        Add or remove participants from this group.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6 flex-1 flex flex-col min-h-0">
                    {/* Add Member Search */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name or email..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {searchQuery.length >= 2 && (
                            <div className="absolute z-10 w-[calc(100%-3rem)] mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-4 flex items-center justify-center">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        <span className="text-sm">Searching...</span>
                                    </div>
                                ) : searchResults?.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No users found.
                                    </div>
                                ) : (
                                    searchResults?.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-3 hover:bg-muted/50 border-b last:border-0">
                                            <div>
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleAddMember(user.id)}
                                                disabled={isMember(user.id) || addMemberMutation.isPending}
                                            >
                                                {isMember(user.id) ? (
                                                    <span className="text-xs text-muted-foreground">Member</span>
                                                ) : (
                                                    <UserPlus className="h-4 w-4 text-indigo-500" />
                                                )}
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Current Members List */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            Current Members
                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{members?.length || 0}</Badge>
                        </h4>
                        <ScrollArea className="flex-1 -mx-2 px-2">
                            <div className="space-y-1">
                                {members?.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-xs font-bold font-mono text-indigo-600">
                                                U{member.userId}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">User #{member.userId}</p>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{member.role}</p>
                                            </div>
                                        </div>
                                        {member.userId !== currentUserId && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemoveMember(member.userId)}
                                                disabled={removeMemberMutation.isPending}
                                            >
                                                <UserMinus className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
