import { useParams, useNavigate } from 'react-router-dom';
import { useGroup, useGroupMembers } from '@/hooks/useGroups';
import { useGroupExpenses } from '@/hooks/useExpenses';
import { useCurrentUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Users, Receipt, PlusCircle, Settings } from 'lucide-react';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { CreateExpenseDialog } from '@/components/expenses/CreateExpenseDialog';
import { ManageMembersDialog } from '@/components/groups/ManageMembersDialog';
import { GroupSettingsDialog } from '@/components/groups/GroupSettingsDialog';
import { useState } from 'react';

export function GroupDetails() {
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const { data: group, isLoading: isLoadingGroup } = useGroup(groupId ? parseInt(groupId) : undefined);
    const { data: members, isLoading: isLoadingMembers } = useGroupMembers(groupId ? parseInt(groupId) : undefined);
    const { data: expenses, isLoading: isLoadingExpenses } = useGroupExpenses(groupId ? parseInt(groupId) : undefined);

    console.log('GroupDetails: members data:', members); // Debug log

    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    if (isLoadingGroup || isLoadingMembers || isLoadingExpenses) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-indigo-600 font-medium">Loading group details...</div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <h2 className="text-2xl font-bold mb-4">Group not found</h2>
                <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/10">
            <div className="max-w-5xl mx-auto">
                {/* Navigation & Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
                        <p className="text-muted-foreground">{group.description || 'No description provided'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden sm:flex items-center gap-2"
                            onClick={() => setIsManageMembersOpen(true)}
                        >
                            <Users className="h-4 w-4" />
                            Manage Members
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="sm:hidden"
                            onClick={() => setIsManageMembersOpen(true)}
                        >
                            <Users className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => setIsSettingsOpen(true)}
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Main Content: Expenses */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-indigo-500" />
                                Group Expenses
                            </h2>
                            <Button size="sm" onClick={() => setIsAddExpenseOpen(true)} className="flex items-center gap-2 shadow-indigo-500/20 shadow-lg">
                                <PlusCircle className="h-4 w-4" />
                                Add Expense
                            </Button>
                        </div>

                        <ExpenseList expenses={expenses || []} members={members || []} />
                    </div>

                    {/* Sidebar: Members & Summary */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="h-5 w-5 text-indigo-500" />
                                    Members
                                </CardTitle>
                                <CardDescription>{members?.length || 0} participants</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {members?.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold font-mono">
                                                    {member.userName ? member.userName.charAt(0).toUpperCase() : `U${member.userId}`}
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {member.userName && member.userName !== "Unknown" ? member.userName : `User #${member.userId}`}
                                                    {member.userId === user?.id && <span className="ml-1.5 text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">You</span>}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter opacity-70">
                                                {member.role}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats Card */}
                        <Card className="bg-indigo-600 text-white border-none shadow-xl shadow-indigo-500/20">
                            <CardHeader className="pb-2 text-indigo-100">
                                <CardTitle className="text-sm font-medium uppercase tracking-widest opacity-80">Total Group Spending</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    INR {(expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0).toFixed(2)}
                                </div>
                                <p className="text-xs text-indigo-200 mt-2 italic">
                                    "Split evenly across {members?.length || 0} members"
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Dialogs */}
                {user && (
                    <>
                        <CreateExpenseDialog
                            open={isAddExpenseOpen}
                            onOpenChange={setIsAddExpenseOpen}
                            userId={user.id}
                            initialGroupId={group.id.toString()}
                        />
                        <ManageMembersDialog
                            open={isManageMembersOpen}
                            onOpenChange={setIsManageMembersOpen}
                            groupId={group.id}
                            currentUserId={user.id}
                        />
                        <GroupSettingsDialog
                            open={isSettingsOpen}
                            onOpenChange={setIsSettingsOpen}
                            groupId={group.id}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
