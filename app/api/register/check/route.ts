import { agencies, db } from '@/lib/db';
import { and, ilike, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zip = (searchParams.get('zip') ?? '').trim();
  const q = (searchParams.get('q') ?? '').trim();

  try {
    if (!db) {
      return NextResponse.json({ agencies: [] });
    }

    if (!zip || !q) {
      return NextResponse.json({ agencies: [] });
    }

    const where = and(
      ilike(agencies.zipCode, `${zip}%`),
      or(ilike(agencies.address, `%${q}%`), ilike(agencies.name, `%${q}%`))
    );

    const matchingAgencies = await db
      .select({
        id: agencies.id,
        name: agencies.name,
        address: agencies.address,
        city: agencies.city,
        country: agencies.country,
        zipCode: agencies.zipCode
      })
      .from(agencies)
      .where(where)
      .limit(5);

    return NextResponse.json({ agencies: matchingAgencies });
  } catch (error) {
    console.error('Agency check error:', error);
    return NextResponse.json({ agencies: [] });
  }
}
