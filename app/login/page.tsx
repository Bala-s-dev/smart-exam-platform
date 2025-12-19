/* app/login/page.tsx */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Invalid email or password');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md border-none shadow-2xl p-4">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight">
            Welcome Back
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to continue to your workspace.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                required
                className="h-12 text-md"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <Input
                type="password"
                required
                className="h-12 text-md"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/30"
            >
              Sign In
            </Button>
          </form>
          <div className="mt-8 text-center text-sm font-medium">
            New here?{' '}
            <Link
              href="/register"
              className="text-primary hover:underline font-bold"
            >
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
