import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validators';
import { hashPassword } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // Rate limit: 10 registrations per 15 min per IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const { success } = await rateLimit(`register:${ip}`, { max: 10 });
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    // SECURITY FIX: role is always hardcoded to STUDENT — never taken from request body
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'STUDENT' },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    // SECURITY FIX: only return Zod validation messages, never internal error details
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
  }
}
