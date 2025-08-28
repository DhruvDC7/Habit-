import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import Joi from 'joi';
import dayjs from 'dayjs';
import { MongoClientFindOne, MongoClientUpdateOne, MongoClientDeleteOne } from '@/helpers/mongo';

const UpdateSchema = Joi.object({
  username: Joi.string().min(2).optional(),
  password: Joi.string().min(6).optional(),
  settings: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'system').optional(),
    notifications: Joi.boolean().optional(),
  }).optional(),
}).min(1);

export async function GET(_, { params }) {
  const auth = getUserFromCookies();
  if (!auth || auth.userId !== params.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { found, data: user } = await MongoClientFindOne('users', { _id: params.userId });
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ userId: String(user._id), email: user.email, username: user.username, joinDate: user.joinDate, settings: user.settings });
}

export async function PUT(req, { params }) {
  const auth = getUserFromCookies();
  if (!auth || auth.userId !== params.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { value, error } = UpdateSchema.validate(body);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (value.password) delete value.password; // separate endpoint for password
  const update = { ...value, updatedAt: dayjs().toISOString() };
  const res = await MongoClientUpdateOne('users', { _id: params.userId }, { $set: update });
  if (!res.status) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data: updated } = await MongoClientFindOne('users', { _id: params.userId });
  return NextResponse.json({ userId: String(updated._id), email: updated.email, username: updated.username, settings: updated.settings });
}

export async function DELETE(_, { params }) {
  const auth = getUserFromCookies();
  if (!auth || auth.userId !== params.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const res = await MongoClientDeleteOne('users', { _id: params.userId });
  if (!res.status) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
