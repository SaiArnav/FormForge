import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { JWTPayload, Role } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'formforge_super_secret_jwt_key_2026_stitch_synapse'
);

const COOKIE_NAME = 'formforge_admin_token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export function checkRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    OWNER: 3,
    EDITOR: 2,
    VIEWER: 1,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}
