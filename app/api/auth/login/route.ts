import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validators';
import { comparePassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify Password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate Token
    const token = await signToken({
      id: user.id,
      name: user.name, // Add this line
      email: user.email,
      role: user.role,
    });

    // Set Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, role: user.role },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Login failed' }, { status: 400 });
  }
}
