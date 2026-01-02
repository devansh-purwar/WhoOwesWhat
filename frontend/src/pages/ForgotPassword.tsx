import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import authApi from '@/api/auth';

export function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [resetToken, setResetToken] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authApi.forgotPassword({ email });
            setIsSubmitted(true);
            if (response.token) {
                setResetToken(response.token);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'An error occurred. Please try again later.');
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
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>
                        {isSubmitted
                            ? "Check your inbox for further instructions"
                            : "Enter your email address and we'll send you a link to reset your password"}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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

                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? "Sending link..." : "Send Reset Link"}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6 py-4 flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">Email Sent!</h3>
                                <p className="text-sm text-muted-foreground">
                                    An email with password reset instructions has been sent to <strong>{email}</strong>.
                                </p>
                                {resetToken && (
                                    <div className="mt-6 p-4 bg-muted rounded-lg text-left border border-indigo-200 dark:border-indigo-900/50">
                                        <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wider flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Development Mode Helper
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                                            In a real app, this link would be in your switchbox. Since we're in dev mode, you can click below to simulate an email click:
                                        </p>
                                        <Link
                                            to={`/reset-password?token=${resetToken}`}
                                            className="inline-block w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-xs transition-colors"
                                        >
                                            Click here to reset password
                                        </Link>
                                    </div>
                                )}
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                                Return to Login
                            </Button>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col border-t pt-6 gap-2">
                    <div className="text-sm text-center text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                            <AlertCircle className="h-3 w-3" />
                            AI Security Tip
                        </span>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground italic px-4">
                        "Remember to use a unique password with at least 12 characters, including symbols and numbers, to protect your financial data."
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
