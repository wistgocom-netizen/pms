
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Store } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { signIn } = useStore();

  useEffect(() => {
    // Force light theme on auth pages
    document.documentElement.classList.remove('dark', 'midnight', 'blue', 'coinlytix', 'green');
    document.documentElement.classList.add('light');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, error } = await signIn(loginId, password);
      if (success) {
        toast({
            title: 'Login Successful',
            description: 'Welcome back!',
        });
        router.push('/dashboard');
      } else {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error || 'An unexpected error occurred.',
        });
      }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message || 'An unexpected error occurred.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <Store className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your email address to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4" suppressHydrationWarning>
            <div className="space-y-2">
              <Label htmlFor="loginId">Email Address</Label>
              <Input
                id="loginId"
                type="email"
                placeholder="name@example.com"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                disabled={isLoading}
                suppressHydrationWarning
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                suppressHydrationWarning
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="underline underline-offset-2 hover:text-primary">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
