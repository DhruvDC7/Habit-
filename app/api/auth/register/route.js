import { NextResponse } from 'next/server';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { MongoClientFindOne, MongoClientInsertOne } from '@/helpers/mongo';
import { signAccess, signRefresh, parseExpires } from '@/lib/jwt';
import { serialize } from 'cookie';

dayjs.extend(utc);
dayjs.extend(timezone);

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().min(2).required(),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { value, error } = schema.validate(body);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const email = value.email.toLowerCase();

    // Check existing user
    const { found } = await MongoClientFindOne('users', { email });
    if (found) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    // Create user
    const passwordHash = await bcrypt.hash(value.password, 10);
    const now = dayjs().tz('Asia/Kolkata').toISOString();
    const createRes = await MongoClientInsertOne('users', {
      email,
      passwordHash,
      username: value.username,
      joinDate: new Date(),
      settings: { theme: 'system', notifications: true },
      createdAt: now,
      updatedAt: now,
    });

    const userId = createRes.id?.toString?.() || createRes.id;
    const payload = { userId, email, name: value.username, role: 'user' };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    const isProd = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure: isProd, sameSite: isProd ? 'strict' : 'lax', path: '/' };
    const setCookieHeader = [
      serialize('access_token', accessToken, { ...base, maxAge: parseExpires(process.env.JWT_EXPIRES_IN || '15m') }),
      serialize('refresh_token', refreshToken, { ...base, maxAge: parseExpires(process.env.JWT_REFRESH_EXPIRES_IN || '7d') }),
    ];

    return new Response(
      JSON.stringify({ user: { id: userId, email, name: value.username } }),
      { status: 201, headers: { 'Content-Type': 'application/json', 'Set-Cookie': setCookieHeader } }
    );
  } catch (err) {
    return NextResponse.json({ error: err?.message || 'Invalid request' }, { status: 400 });
  }
}
