import { NextResponse } from 'next/server';
import { getAuthSession, checkRole, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getAuthSession();
  if (!session || !checkRole(session.role, 'VIEWER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await db.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      lastLogin: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session || !checkRole(session.role, 'OWNER')) {
    return NextResponse.json({ error: 'Forbidden: Only Owners can manage admin users' }, { status: 403 });
  }

  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await db.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.adminUser.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role || 'EDITOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
