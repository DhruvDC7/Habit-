import { NextResponse } from 'next/server';
import Joi from 'joi';
import dayjs from 'dayjs';
import { getUserFromCookies } from '@/lib/auth';
import { MongoClientFind, MongoClientInsertOne } from '@/helpers/mongo';

const HabitSchema = Joi.object({
  name: Joi.string().min(1).required(),
  icon: Joi.string().default('dot'),
  frequency: Joi.object({
    type: Joi.string().valid('daily', 'custom').required(),
    days: Joi.array().items(Joi.string().valid('MON','TUE','WED','THU','FRI','SAT','SUN')).optional(),
  }).default({ type: 'daily' }),
  reminderTime: Joi.string().allow(null).optional(),
  isReminderEnabled: Joi.boolean().default(false),
});

export async function GET() {
  const auth = getUserFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data } = await MongoClientFind('habits', { userId: auth.userId, isActive: true }, { sort: { createdAt: -1 } });
  return NextResponse.json(data);
}

export async function POST(req) {
  const auth = getUserFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { value, error } = HabitSchema.validate(body);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const now = dayjs().toISOString();
  const res = await MongoClientInsertOne('habits', { ...value, userId: auth.userId, isActive: true, createdAt: now, updatedAt: now });
  return NextResponse.json({ id: res.id, ...value }, { status: 201 });
}
