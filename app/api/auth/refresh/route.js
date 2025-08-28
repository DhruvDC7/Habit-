import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serialize } from 'cookie';
import { verifyRefresh, signAccess, signRefresh, parseExpires } from '@/lib/jwt';

export async function POST() {
  try {
    const cookieStore = cookies();
    const rt = cookieStore.get('refresh_token')?.value;
    if (!rt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyRefresh(rt);
    if (!payload?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const newAccess = signAccess({ userId: payload.userId, email: payload.email, name: payload.name, role: payload.role || 'user' });
    const newRefresh = signRefresh({ userId: payload.userId, email: payload.email, name: payload.name, role: payload.role || 'user' });

    const isProd = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure: isProd, sameSite: isProd ? 'strict' : 'lax', path: '/' };
    const headers = new Headers();
    headers.append('Set-Cookie', serialize('access_token', newAccess, { ...base, maxAge: parseExpires(process.env.JWT_EXPIRES_IN || '15m') }));
    headers.append('Set-Cookie', serialize('refresh_token', newRefresh, { ...base, maxAge: parseExpires(process.env.JWT_REFRESH_EXPIRES_IN || '7d') }));

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
