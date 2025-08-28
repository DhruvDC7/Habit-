import dayjs from 'dayjs';

export function isoDateUTC(date = new Date()) {
  return dayjs(date).utc?.() ? dayjs(date).utc().format('YYYY-MM-DD') : dayjs(date).format('YYYY-MM-DD');
}

export function weekdayUTC(date = new Date()) {
  // Returns MON..SUN in UTC by default
  const d = new Date(date.toISOString().slice(0, 10));
  const day = d.getUTCDay(); // 0..6 (Sun..Sat)
  return ['SUN','MON','TUE','WED','THU','FRI','SAT'][day];
}

export function computeLongestStreak(dates) {
  // dates: array of 'YYYY-MM-DD'
  if (!dates?.length) return 0;
  const sorted = Array.from(new Set(dates)).sort();
  let max = 1, cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = dayjs(sorted[i-1]);
    const curr = dayjs(sorted[i]);
    if (curr.diff(prev, 'day') === 1) {
      cur += 1; max = Math.max(max, cur);
    } else if (curr.isSame(prev)) {
      continue;
    } else {
      cur = 1;
    }
  }
  return max;
}

export function weekBounds(date = new Date()) {
  // Monday as start of week
  const d = dayjs(date);
  const dow = (d.day() + 6) % 7; // 0 for Monday
  const start = d.subtract(dow, 'day').startOf('day');
  const end = start.add(6, 'day').endOf('day');
  return { start: start.toDate(), end: end.toDate() };
}
