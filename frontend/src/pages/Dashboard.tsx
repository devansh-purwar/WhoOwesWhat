import { useCurrentUser } from '@/hooks/useUser';
import { useUserGroups } from '@/hooks/useGroups';
import { useNavigate } from 'react-router-dom';
import { useUserBalances, useUserNetBalance } from '@/hooks/useBalances';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog';
import { CreateExpenseDialog } from '@/components/expenses/CreateExpenseDialog';
import { useState } from 'react';

export function Dashboard() {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const { data: groups } = useUserGroups(user?.id);
    const { data: balances } = useUserBalances(user?.id);
    const { data: netBalance } = useUserNetBalance(user?.id);

    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Splitwise AI</h1>
                        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}!</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>

                {/* Net Balance Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Your Net Balance</CardTitle>
                        <CardDescription>Overall balance across all groups</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {netBalance && Object.keys(netBalance).length > 0 ? (
                            <div className="space-y-2">
                                {Object.entries(netBalance).map(([currency, amount]) => (
                                    <div key={currency} className="flex items-center justify-between">
                                        <span className="text-lg font-medium">{currency}</span>
                                        <Badge variant={amount >= 0 ? 'default' : 'destructive'} className="text-lg">
                                            {amount >= 0 ? '+' : ''}{amount.toFixed(2)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No balances yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* Groups Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Groups</CardTitle>
                            <CardDescription>{groups?.length || 0} groups</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {groups && groups.length > 0 ? (
                                <div className="space-y-3">
                                    {groups.map((group) => (
                                        <div
                                            key={group.id}
                                            className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition shadow-sm hover:shadow-md border-indigo-100 dark:border-slate-800"
                                            onClick={() => navigate(`/groups/${group.id}`)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">{group.name}</h3>
                                                    {group.description && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{group.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No groups yet. Create one to get started!</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Balances Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Balances</CardTitle>
                            <CardDescription>{balances?.length || 0} active balances</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {balances && balances.length > 0 ? (
                                <div className="space-y-3">
                                    {balances.slice(0, 5).map((balance: any) => (
                                        <div key={balance.id} className="flex items-center justify-between p-2 border-b">
                                            <div className="text-sm">
                                                {balance.fromUserId === user?.id ? (
                                                    <span>You owe {balance.toUserName && balance.toUserName !== 'Unknown' ? balance.toUserName : `User #${balance.toUserId}`}</span>
                                                ) : (
                                                    <span>{balance.fromUserName && balance.fromUserName !== 'Unknown' ? balance.fromUserName : `User #${balance.fromUserId}`} owes you</span>
                                                )}
                                            </div>
                                            <Badge variant="outline">
                                                {balance.currency} {balance.amount.toFixed(2)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No balances to settle</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 flex gap-4">
                    <Button size="lg" onClick={() => setIsCreateGroupOpen(true)}>Create Group</Button>
                    <Button size="lg" variant="outline" onClick={() => setIsCreateExpenseOpen(true)}>Add Expense</Button>
                </div>

                {user && (
                    <>
                        <CreateGroupDialog
                            open={isCreateGroupOpen}
                            onOpenChange={setIsCreateGroupOpen}
                            userId={user.id}
                        />
                        <CreateExpenseDialog
                            open={isCreateExpenseOpen}
                            onOpenChange={setIsCreateExpenseOpen}
                            userId={user.id}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
