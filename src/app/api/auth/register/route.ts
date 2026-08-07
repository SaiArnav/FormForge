import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUserCount = await db.adminUser.count();

    // Only allow registration if no admin exists (first user becomes owner)
    if (existingUserCount > 0) {
      return NextResponse.json(
        { error: 'An admin already exists. Only the owner can invite new admins.' },
        { status: 403 }
      );
    }

    const existing = await db.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await db.adminUser.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'OWNER',
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
