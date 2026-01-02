import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            <div className="max-w-3xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="space-y-4">
                    <h1 className="text-6xl font-extrabold tracking-tight lg:text-7xl">
                        Split Expenses <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">Effortlessly</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        The smartest way to share bills and split expenses with friends, family, and roommates. Powered by AI for seamless expense tracking.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="text-lg px-8 h-14 rounded-full shadow-lg shadow-indigo-500/20" onClick={() => navigate('/register')}>
                        Get Started
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-full border-2" onClick={() => navigate('/login')}>
                        Sign In
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                    {[
                        { title: "No More Stress", desc: "Easily track who owes who without the awkwardness." },
                        { title: "Split Any Way", desc: "By shares, percentages, or exact amounts. We handle it all." },
                        { title: "AI Powered", desc: "Smart categorization and insights into your spending habits." }
                    ].map((feature, i) => (
                        <Card key={i} className="border-none bg-white/50 backdrop-blur-sm dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="p-6">
                                <CardTitle className="text-lg">{feature.title}</CardTitle>
                                <CardDescription>{feature.desc}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>

            <footer className="mt-20 text-muted-foreground text-sm">
                © 2026 Splitwise AI. All rights reserved.
            </footer>
        </div>
    );
}
