'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { user, loading, logout } = useAuth();

  if (loading) return null; // Prevent flashing

  return (
    <nav className="border-b bg-white dark:bg-gray-950 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          SmartExam<span className="text-gray-800">AI</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">
                Welcome, {user.name} ({user.role})
              </span>
              <Button variant="outline" onClick={logout} size="sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
