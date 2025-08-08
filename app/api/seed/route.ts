export const dynamic = 'force-dynamic';

import { agencies, agents, bookings, db, hotels, roomTypes } from '@/lib/db';

export async function GET() {
  try {
    // Check if data already exists
    const existingAgents = await db.select().from(agents).limit(1);

    if (existingAgents.length > 0) {
      return Response.json({
        message: 'Database already seeded! Clear data first to re-seed.'
      });
    }

    // Create sample agencies
    const sampleAgencies = await db
      .insert(agencies)
      .values([
        {
          id: crypto.randomUUID(),
          name: 'Travel Pro Agency',
          address: '123 Main St',
          city: 'New York',
          country: 'USA',
          zipCode: '10001',
          status: 'active'
        }
      ])
      .returning({ id: agencies.id });

    // Create sample agents
    const sampleAgents = await db
      .insert(agents)
      .values([
        {
          id: crypto.randomUUID(),
          email: 'agent@example.com',
          firstName: 'John',
          lastName: 'Doe',
          agencyId: sampleAgencies[0].id,
          role: 'agent',
          status: 'active'
        }
      ])
      .returning({ id: agents.id });

    // Create sample hotels
    const sampleHotels = await db
      .insert(hotels)
      .values([
        {
          id: crypto.randomUUID(),
          name: 'Grand Plaza Hotel',
          address: '456 Hotel Ave',
          city: 'Miami',
          country: 'USA',
          status: 'active'
        },
        {
          id: crypto.randomUUID(),
          name: 'Ocean View Resort',
          address: '789 Beach Blvd',
          city: 'California',
          country: 'USA',
          status: 'active'
        }
      ])
      .returning({ id: hotels.id });

    // Create sample room types
    const sampleRoomTypes = await db
      .insert(roomTypes)
      .values([
        {
          id: crypto.randomUUID(),
          hotelId: sampleHotels[0].id,
          name: 'Standard Room',
          pointsFactor: '1.0'
        },
        {
          id: crypto.randomUUID(),
          hotelId: sampleHotels[0].id,
          name: 'Deluxe Suite',
          pointsFactor: '2.5'
        },
        {
          id: crypto.randomUUID(),
          hotelId: sampleHotels[1].id,
          name: 'Ocean View',
          pointsFactor: '2.0'
        }
      ])
      .returning({ id: roomTypes.id });

    // Create sample bookings
    await db.insert(bookings).values([
      {
        id: crypto.randomUUID(),
        agentId: sampleAgents[0].id,
        hotelId: sampleHotels[0].id,
        roomTypeId: sampleRoomTypes[0].id,
        guestName: 'Jane Smith',
        arrivalDate: '2024-03-15',
        numberOfNights: 3,
        points: 3, // 3 nights × 1.0 factor
        yourRef: 'REF001',
        hotelRef: 'HTL001',
        status: 'verified'
      },
      {
        id: crypto.randomUUID(),
        agentId: sampleAgents[0].id,
        hotelId: sampleHotels[1].id,
        roomTypeId: sampleRoomTypes[2].id,
        guestName: 'Bob Johnson',
        arrivalDate: '2024-03-20',
        numberOfNights: 5,
        points: 10, // 5 nights × 2.0 factor
        yourRef: 'REF002',
        status: 'pending'
      }
    ]);

    return Response.json({
      message: 'Database seeded with bookings successfully!'
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return Response.json(
      {
        error:
          'Failed to seed database: ' +
          (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    );
  }
}
