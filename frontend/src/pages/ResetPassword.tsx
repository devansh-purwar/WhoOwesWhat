import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Lock, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import authApi from '@/api/auth';

export function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!token) {
            setError('Reset token is missing.');
            return;
        }

        setIsLoading(true);

        try {
            await authApi.resetPassword({
                token,
                newPassword: password
            });
            setIsSuccess(true);
            // Automatically redirect after a few seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired or already been used.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <Card className="w-full max-w-md shadow-xl border-none relative animate-in fade-in zoom-in duration-300">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/login')}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Login
                </Button>

                <CardHeader className="space-y-1 pt-12">
                    <CardTitle className="text-2xl font-bold">New Password</CardTitle>
                    <CardDescription>
                        {isSuccess
                            ? "Your password has been reset successfully"
                            : "Set a secure new password for your account"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="password">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">Confirm Password</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="pl-10"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button className="w-full h-11" type="submit" disabled={isLoading || !token}>
                                {isLoading ? "Updating Password..." : "Update Password"}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6 py-4 flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Password Updated!</h3>
                                <p className="text-sm text-muted-foreground">
                                    Your password has been changed. You will be redirected to the login page shortly.
                                </p>
                            </div>
                            <Button className="w-full" onClick={() => navigate('/login')}>
                                Go to Login Now
                            </Button>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col border-t pt-6 gap-2">
                    <p className="text-[10px] text-center text-muted-foreground italic px-4">
                        "We use advanced AI security metrics to ensure your account remains protected during password recovery."
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
