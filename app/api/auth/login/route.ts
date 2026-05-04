import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validators';
import { comparePassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // Rate limit: 10 login attempts per 15 min per IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const { success } = await rateLimit(`login:${ip}`, { max: 10 });
  if (!success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Find user — always run comparePassword even if user not found
    // to prevent timing-based user enumeration attacks
    const user = await prisma.user.findUnique({ where: { email } });

    const dummyHash = '$2a$10$dummyhashfordummycomparison...................';
    const isValid = user
      ? await comparePassword(password, user.password)
      : await comparePassword(password, dummyHash).then(() => false);

    // Single generic error for both wrong email and wrong password
    if (!user || !isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      );
    }

    const token = await signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Login failed' }, { status: 400 });
  }
}
