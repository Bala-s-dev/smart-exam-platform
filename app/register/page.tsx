/* app/register/page.tsx */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
      }
    } catch {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[420px] anim-up">
        {/* Brand */}
        <div className="text-center mb-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'oklch(0.52 0.22 264)' }}
          >
            <GraduationCap className="text-white" size={22} />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground text-[15px] mt-1.5">
            Join SmartExam AI — it's free to start
          </p>
        </div>

        <div className="card-base p-8 space-y-4">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl text-[14px] font-medium"
              style={{ background: 'oklch(0.96 0.05 25)', color: 'oklch(0.55 0.2 25)' }}
            >
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  required
                  placeholder="Alex Johnson"
                  disabled={loading}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 h-11 rounded-xl border-border text-[14px]"
                />
              </div>
            </div>

            <div>
              <label className="field-label">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  disabled={loading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-11 rounded-xl border-border text-[14px]"
                />
              </div>
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  disabled={loading}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 h-11 rounded-xl border-border text-[14px]"
                />
              </div>
            </div>

            <div>
              <label className="field-label">I am a…</label>
              <Select value={formData.role} disabled={loading} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger className="h-11 rounded-xl border-border text-[14px]">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor / Teacher</SelectItem>
                </SelectContent>
              </Select>
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
                  Creating account…
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[14px] text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: 'oklch(0.52 0.22 264)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
