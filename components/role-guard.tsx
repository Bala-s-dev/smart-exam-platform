'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: ('STUDENT' | 'INSTRUCTOR' | 'ADMIN')[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!allowedRoles.includes(user.role as any)) {
        router.push('/dashboard'); // Redirect unauthorized users
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !authorized) return null;

  return <>{children}</>;
}
