import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const { JWT_SECRET = 'dev-secret-change-me' } = process.env;

export function signToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', ...options });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_) {
    return null;
  }
}

export function setAuthCookie(token) {
  const cookieStore = cookies();
  cookieStore.set('access_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.set('access_token', '', { httpOnly: true, path: '/', maxAge: 0 });
}

export function getUserFromCookies() {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
