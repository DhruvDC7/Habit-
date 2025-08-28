import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import Joi from 'joi';
import dayjs from 'dayjs';
import { MongoClientFindOne, MongoClientUpdateOne, MongoClientDeleteOne } from '@/helpers/mongo';

const UpdateSchema = Joi.object({
  name: Joi.string().min(1).optional(),
  icon: Joi.string().optional(),
  frequency: Joi.object({
    type: Joi.string().valid('daily', 'custom').required(),
    days: Joi.array().items(Joi.string().valid('MON','TUE','WED','THU','FRI','SAT','SUN')).optional(),
  }).optional(),
  reminderTime: Joi.string().allow(null).optional(),
  isReminderEnabled: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export async function GET(_, { params }) {
  const auth = getUserFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { found, data } = await MongoClientFindOne('habits', { _id: params.habitId, userId: auth.userId });
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req, { params }) {
  const auth = getUserFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { value, error } = UpdateSchema.validate(body);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const update = { ...value, updatedAt: dayjs().toISOString() };
  const res = await MongoClientUpdateOne('habits', { _id: params.habitId, userId: auth.userId }, { $set: update });
  if (!res.status) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data } = await MongoClientFindOne('habits', { _id: params.habitId, userId: auth.userId });
  return NextResponse.json(data);
}

export async function DELETE(_, { params }) {
  const auth = getUserFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const res = await MongoClientDeleteOne('habits', { _id: params.habitId, userId: auth.userId });
  if (!res.status) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
