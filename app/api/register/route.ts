import { NextResponse } from 'next/server';

const base = process.env.NEON_REST_URL!;
const auth = process.env.NEON_REST_JWT;

export async function POST(req: Request) {
  const body = await req.json();

  // Minimal validation
  if (!body?.p_email)
    return NextResponse.json({ error: 'email required' }, { status: 400 });

  const res = await fetch(`${base}/rpc/register_agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json(); // { agent_id, agency_id }
  return NextResponse.json(data);
}
