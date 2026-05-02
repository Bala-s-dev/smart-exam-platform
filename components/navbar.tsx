'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, GraduationCap } from 'lucide-react';

export function Navbar() {
  const { user, loading, logout } = useAuth();
  // Track whether we're mounted on the client yet
  // Server always renders the "logged-out" skeleton to match SSR HTML
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[60px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'oklch(0.52 0.22 264)' }}
          >
            <GraduationCap className="text-white" size={18} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-foreground">
            Smart<span style={{ color: 'oklch(0.52 0.22 264)' }}>Exam</span>
            <span className="text-muted-foreground font-medium"> AI</span>
          </span>
        </Link>

        {/* Right side — only render auth UI after client mount to prevent hydration mismatch */}
        <div className="flex items-center gap-2">
          {!mounted ? (
            // Exact same placeholder rendered on server AND client first paint
            <div className="h-8 w-32 rounded-lg" />
          ) : loading ? (
            <div className="h-8 w-32 rounded-lg shimmer" />
          ) : user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-sm">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: 'oklch(0.52 0.22 264)' }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="font-medium text-foreground text-[13px]">
                  {user.name}
                </span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-accent text-muted-foreground uppercase tracking-wide">
                  {user.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'}
                </span>
              </div>

              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground h-8 px-3 rounded-lg"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={logout}
                size="sm"
                className="gap-1.5 text-[13px] h-8 px-3 rounded-lg border-border text-muted-foreground hover:text-foreground"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[13px] font-medium h-8 px-4 text-muted-foreground hover:text-foreground rounded-lg"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="text-[13px] font-semibold h-8 px-4 rounded-lg"
                  style={{ background: 'oklch(0.52 0.22 264)' }}
                >
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
