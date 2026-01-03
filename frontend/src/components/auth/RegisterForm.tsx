import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useRegisterUser } from '@/hooks/useUser';
import type { RegisterUserRequest } from '@/api/types';
import authApi from '@/api/auth';
import { authService } from '@/services/authService';

export function RegisterForm() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterUserRequest>();
    const registerMutation = useRegisterUser();
    const [error, setError] = useState<string>('');

    const onSubmit = async (data: RegisterUserRequest) => {
        try {
            console.log('Registering user:', data);
            const response = await registerMutation.mutateAsync(data);
            console.log('Registration successful, response:', response);
            // The hook useRegisterUser already deals with token storage
            // Redirect
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
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
                <CardHeader className="pt-12">
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>Join Splitwise AI to start tracking expenses</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="name">Full Name</label>
                            <Input
                                id="name"
                                {...register('name', { required: 'Name is required' })}
                                placeholder="John Doe"
                                className="w-full"
                            />
                            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
                            <Input
                                id="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                type="email"
                                placeholder="m@example.com"
                                className="w-full"
                            />
                            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="phone">Phone (optional)</label>
                            <Input
                                id="phone"
                                {...register('phone')}
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
                            <Input
                                id="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                                type="password"
                                placeholder="••••••••"
                                className="w-full"
                            />
                            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
                        </div>

                        {error && <p className="text-sm text-destructive font-medium">{error}</p>}

                        <Button type="submit" className="w-full h-11" disabled={registerMutation.isPending}>
                            {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
