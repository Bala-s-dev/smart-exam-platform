/* components/role-guard.tsx */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('STUDENT' | 'INSTRUCTOR' | 'ADMIN')[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (!allowedRoles.includes(user.role as any)) {
      router.replace('/dashboard');
    } else {
      setAuthorized(true);
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !authorized) {
    return (
      <div className="flex items-center justify-center h-[50vh] gap-3 text-muted-foreground">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[14px] font-medium">Checking access…</span>
      </div>
    );
  }

  return <>{children}</>;
}
