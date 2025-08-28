import { NextResponse } from 'next/server';
import Joi from 'joi';
import dayjs from 'dayjs';
import { getUserFromCookies } from '@/lib/auth';
import { isoDateUTC } from '@/lib/metrics';
import { MongoClientFind, MongoClientFindOne, MongoClientInsertOne, MongoClientDeleteOne } from '@/helpers/mongo';

// GET /api/completions?from=YYYY-MM-DD&to=YYYY-MM-DD&habitId=optional
export async function GET(req) {
  const auth = getUserFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const habitId = searchParams.get('habitId');

  const query = { userId: auth.userId };
  if (habitId) query.habitId = habitId;
  if (from && to) query.date = { $gte: from, $lte: to };
  else if (from) query.date = { $gte: from };
  else if (to) query.date = { $lte: to };

  const { data } = await MongoClientFind('completions', query, { sort: { date: -1 } });
  return NextResponse.json(data);
}

// POST /api/completions toggle
// body: { habitId: string, date?: YYYY-MM-DD, notes?: string }
const ToggleSchema = Joi.object({
  habitId: Joi.string().required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: Joi.string().max(500).allow('').optional(),
});

export async function POST(req) {
  const auth = getUserFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { value, error } = ToggleSchema.validate(body);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const date = value.date || isoDateUTC(new Date());
  const key = { userId: auth.userId, habitId: value.habitId, date };

  const { found, data: existing } = await MongoClientFindOne('completions', key);
  if (found && existing?._id) {
    await MongoClientDeleteOne('completions', { _id: existing._id });
    return NextResponse.json({ toggled: 'deleted', id: String(existing._id) });
  }

  const now = dayjs().toISOString();
  const res = await MongoClientInsertOne('completions', { ...key, timestamp: now, notes: value.notes || '' });
  return NextResponse.json({ toggled: 'created', id: res.id }, { status: 201 });
}
