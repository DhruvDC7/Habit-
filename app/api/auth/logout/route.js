import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const isProd = process.env.NODE_ENV === 'production';
  const base = { httpOnly: true, secure: isProd, sameSite: isProd ? 'strict' : 'lax', path: '/', maxAge: 0 };
  const headers = new Headers();
  headers.append('Set-Cookie', serialize('access_token', '', base));
  headers.append('Set-Cookie', serialize('refresh_token', '', base));
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
