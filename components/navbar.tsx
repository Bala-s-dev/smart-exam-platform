/* components/navbar.tsx */
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="h-16 border-b bg-white/50" />;

  return (
    <nav className="glass bg-white/80 dark:bg-gray-950/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-1.5 rounded-lg">
            <div className="w-5 h-5 border-2 border-white rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            SmartExam<span className="text-primary">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {user.name}{' '}
                  <span className="text-muted-foreground opacity-70">
                    ({user.role})
                  </span>
                </span>
              </div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={logout}
                size="sm"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />{' '}
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="font-medium">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="font-semibold shadow-md shadow-primary/20">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
