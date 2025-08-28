import { NextResponse } from 'next/server';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { ObjectId } from 'mongodb';
import { MongoClientFindOne, MongoClientUpdateOne } from '@/helpers/mongo';
import { signAccess, signRefresh, parseExpires } from '@/lib/jwt';
import { serialize } from 'cookie';

dayjs.extend(utc);
dayjs.extend(timezone);

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export async function POST(req) {
  try {
    // 1) Validate input
    const body = await req.json();
    const { value, error } = schema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const email = value.email.toLowerCase();

    // 2) Find existing user
    const { found, data: existingUser } = await MongoClientFindOne('users', { email });
    if (!found || !existingUser) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3) Verify password
    const ok = await bcrypt.compare(value.password, existingUser.passwordHash || '');
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    // 4) Create tokens
    const userId = existingUser.id || existingUser._id?.toString();
    const payload = { userId, name: existingUser.name || existingUser.username || null, email, role: existingUser.role || 'user' };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    // 5) Update last login timestamps
    const now = dayjs().tz('Asia/Kolkata').toISOString();
    let filter = { _id: userId };
    try { filter = { _id: new ObjectId(userId) }; } catch {}
    await MongoClientUpdateOne('users', filter, { $set: { lastLoginAt: now, updatedAt: now } });

    // 6) Set cookies
    const isProd = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure: isProd, sameSite: isProd ? 'strict' : 'lax', path: '/' };
    const setCookieHeader = [
      serialize('access_token', accessToken, { ...base, maxAge: parseExpires(process.env.JWT_EXPIRES_IN || '15m') }),
      serialize('refresh_token', refreshToken, { ...base, maxAge: parseExpires(process.env.JWT_REFRESH_EXPIRES_IN || '7d') }),
    ];

    return new Response(
      JSON.stringify({ user: { id: userId, email, name: existingUser.name || existingUser.username || null, role: existingUser.role || 'user' } }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Set-Cookie': setCookieHeader } }
    );
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}
