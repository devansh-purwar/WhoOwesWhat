import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { authApi } from '@/api/auth';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.login({ email, password });
            console.log("Login successful", response);

            // Store user info in localStorage (matches useUser.ts logic)
            localStorage.setItem('userId', response.id.toString());
            localStorage.setItem('splitwise_user', JSON.stringify({ id: response.id, name: response.name, email: response.email }));
            if (response.token) {
                localStorage.setItem('splitwise_auth_token', response.token);
            }

            setIsLoading(false);
            window.location.href = '/dashboard';
        } catch (err: any) {
            setIsLoading(false);
            setError(err.response?.data?.message || err.message || "Failed to sign in. Please try again.");
            console.error("Login error:", err);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <Card className="w-full max-w-md shadow-xl border-none relative">
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/')}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
                <CardHeader className="space-y-1 pt-12">
                    <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                    <CardDescription>Enter your email and password to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
                                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-primary hover:underline">Sign up</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
