import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected routes
const protectedRoutes = ['/dashboard', '/exams', '/topics'];
const instructorRoutes = ['/exams/create', '/exams/analytics'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // 1. Check if route requires auth
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // 2. Verify Token
    const payload = await verifyToken(token);
    if (!payload) {
      // Invalid token
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // 3. Role-based access control (RBAC)
    const isInstructorRoute = instructorRoutes.some((route) =>
      pathname.startsWith(route)
    );
    if (
      isInstructorRoute &&
      (payload as any).role !== 'INSTRUCTOR' &&
      (payload as any).role !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url)); // Unauthorized for students
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/exams/:path*', '/topics/:path*'],
};
