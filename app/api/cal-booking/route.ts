import { NextResponse } from 'next/server'

type RequestBody = {
  date: string | null;
  time: string;
  food?: string[];
  movie?: string;
  participantName?: string;
  participantEmail?: string;
}

function parseTimeToDate(dateStr: string, timeStr: string) {
  // dateStr expected ISO date string
  const base = new Date(dateStr);
  if (isNaN(base.getTime())) return null;

  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  const dt = new Date(base);
  dt.setHours(hour, minute, 0, 0);
  return dt;
}

export async function POST(request: Request) {
  const CAL_API_KEY = process.env.CAL_API_KEY;
  const CAL_EVENT_TYPE_ID = process.env.CAL_EVENT_TYPE_ID;

  if (!CAL_API_KEY || !CAL_EVENT_TYPE_ID) {
    return NextResponse.json({ success: false, error: 'Missing Cal.com configuration on server' }, { status: 500 });
  }

  try {
    const body = (await request.json()) as RequestBody;
    const { date, time, food, movie, participantName, participantEmail } = body;

    if (!date || !time) {
      return NextResponse.json({ success: false, error: 'Missing date or time' }, { status: 400 });
    }

    const start = parseTimeToDate(date, time);
    if (!start) return NextResponse.json({ success: false, error: 'Unable to parse date/time' }, { status: 400 });

    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour

    type CalBookingPayload = {
      eventTypeId: string;
      startTime: string;
      endTime: string;
      metadata?: { food: string[]; movie: string; source?: string };
      customer?: { name?: string; email?: string };
    };

    const payload: CalBookingPayload = {
      eventTypeId: CAL_EVENT_TYPE_ID,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      metadata: {
        food: food ?? [],
        movie: movie ?? '',
        source: 'datebyte'
      }
    };

    if (participantName || participantEmail) {
      payload.customer = { name: participantName ?? 'Guest', email: participantEmail ?? '' };
    }

    const res = await fetch('https://api.cal.com/v2/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (error: unknown) {
    console.error('Cal booking error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: 'Unknown error' }, { status: 500 });
  }
}
