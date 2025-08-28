import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import { MongoClientFind } from '@/helpers/mongo';
import { computeLongestStreak, weekBounds, isoDateUTC } from '@/lib/metrics';

export async function GET() {
  const auth = getUserFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1) Total completions
  const { data: all } = await MongoClientFind('completions', { userId: auth.userId }, { projection: { date: 1 } });
  const total = all.length;

  // 2) Longest streak by date strings
  const dates = all.map((c) => c.date).filter(Boolean);
  const longestStreak = computeLongestStreak(dates);

  // 3) Current week count
  const { start, end } = weekBounds(new Date());
  const from = isoDateUTC(start);
  const to = isoDateUTC(end);
  const { data: week } = await MongoClientFind('completions', { userId: auth.userId, date: { $gte: from, $lte: to } });
  const weekCount = week.length;

  return NextResponse.json({ total, longestStreak, weekCount, from, to });
}
