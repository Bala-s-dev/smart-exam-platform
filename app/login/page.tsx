/* app/login/page.tsx */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const CACHE_KEY = 'smartexam_user';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (res.ok) {
        // Fetch full user and write to cache BEFORE navigating
        const meRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (meRes.ok) {
          const { user } = await meRes.json();
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(user));
          } catch {}
        }
        // Full page reload so navbar mounts fresh and reads cache immediately
        window.location.href = '/dashboard';
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid email or password');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[420px] anim-up">
        <div className="text-center mb-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'oklch(0.52 0.22 264)' }}
          >
            <GraduationCap className="text-white" size={22} />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-[15px] mt-1.5">
            Sign in to your SmartExam account
          </p>
        </div>

        <div className="card-base p-8 space-y-5">
          {error && (
            <div
              className="flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-medium"
              style={{
                background: 'oklch(0.96 0.05 25)',
                color: 'oklch(0.55 0.2 25)',
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Email address</label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  disabled={loading}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10 h-11 rounded-xl border-border text-[14px]"
                />
              </div>
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="password"
                  required
                  placeholder="••••••••••"
                  disabled={loading}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10 h-11 rounded-xl border-border text-[14px]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-[15px] font-semibold rounded-xl mt-1"
              style={{ background: 'oklch(0.52 0.22 264)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[14px] text-muted-foreground mt-6">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: 'oklch(0.52 0.22 264)' }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
