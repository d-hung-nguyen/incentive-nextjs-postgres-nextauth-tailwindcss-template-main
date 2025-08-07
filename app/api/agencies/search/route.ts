import { NextResponse } from 'next/server';

const base = process.env.NEON_REST_URL!;
const auth = process.env.NEON_REST_JWT;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zip = searchParams.get('zip');
  const q = searchParams.get('q')?.trim();

  if (!zip)
    return NextResponse.json({ error: 'zip required' }, { status: 400 });

  const params = new URLSearchParams({
    select: 'id,name,address,city,country',
    zip_code: `eq.${zip}`,
    order: 'name.asc'
  });

  if (q && q.length >= 2)
    params.set('address', `ilike.%${encodeURIComponent(q)}%`);

  const res = await fetch(`${base}/agencies?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      Range: '0-49',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {})
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
