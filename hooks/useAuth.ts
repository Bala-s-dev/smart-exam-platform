'use client';

import { useState, useEffect, useCallback } from 'react';

type User = { id: string; name: string; email: string; role: string } | null;

const CACHE_KEY = 'smartexam_user';

function readCache(): User {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(user: User) {
  if (typeof window === 'undefined') return;
  try {
    if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    else localStorage.removeItem(CACHE_KEY);
  } catch {}
}

export function useAuth() {
  // useState initializer runs synchronously on first render —
  // so user is populated from cache BEFORE the component paints
  const [user, setUser] = useState<User>(() => readCache());
  // If cache has a user, we're not "loading" visually — skip the flash
  const [loading, setLoading] = useState<boolean>(() => readCache() === null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) return res.json();
        // Server says unauthenticated — clear stale cache
        writeCache(null);
        setUser(null);
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          writeCache(data.user);
        }
      })
      .catch(() => {
        writeCache(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    writeCache(null);
    setUser(null);
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    document.cookie =
      'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
    window.location.href = '/';
  }, []);

  return { user, loading, logout };
}
