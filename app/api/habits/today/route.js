import { NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth';
import { weekdayUTC } from '@/lib/metrics';
import { MongoClientFind } from '@/helpers/mongo';

export async function GET() {
  const auth = getUserFromCookies();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const today = weekdayUTC();
  const query = {
    userId: auth.userId,
    isActive: true,
    $or: [
      { 'frequency.type': 'daily' },
      { 'frequency.type': 'custom', 'frequency.days': today },
    ],
  };
  const { data } = await MongoClientFind('habits', query, { sort: { createdAt: -1 } });
  return NextResponse.json(data);
}
