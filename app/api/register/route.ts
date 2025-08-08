import { agencies, agents, db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agent, agency, existingAgencyId } = body;

    // Check if agent already exists
    const existingAgent = await db
      .select()
      .from(agents)
      .where(eq(agents.email, agent.email))
      .limit(1);

    if (existingAgent.length > 0) {
      return NextResponse.json({
        message:
          'This email is already registered. If you forgot your credentials, please contact support.'
      });
    }

    let agencyId = existingAgencyId;

    // Create new agency if needed
    if (!agencyId && agency) {
      const newAgency = await db
        .insert(agencies)
        .values({
          id: crypto.randomUUID(),
          name: agency.name,
          address: agency.address,
          city: agency.city,
          country: agency.country,
          zipCode: agency.zip_code,
          status: 'pending'
        })
        .returning({ id: agencies.id });

      agencyId = newAgency[0].id;
    }

    // Create new agent
    await db.insert(agents).values({
      id: crypto.randomUUID(),
      email: agent.email,
      firstName: agent.first_name,
      lastName: agent.last_name,
      telephone: agent.telephone,
      agencyId: agencyId,
      role: 'agent',
      status: 'pending'
    });

    const responseMessage = existingAgencyId
      ? 'Registration successful! You have been added to the existing agency. Your application will be reviewed by our team.'
      : 'Registration successful! Your new agency and agent profile have been created. Your application will be reviewed by our team.';

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error:
          'Registration failed. Please check your information and try again.'
      },
      { status: 500 }
    );
  }
}
