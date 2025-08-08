export const dynamic = 'force-dynamic';

import { agencies, agents, bookings, db, hotels, roomTypes } from '@/lib/db';

export async function POST() {
  try {
    // Delete in correct order to respect foreign key constraints
    await db.delete(bookings);
    await db.delete(roomTypes);
    await db.delete(hotels);
    await db.delete(agents);
    await db.delete(agencies);

    return Response.json({
      message: 'All data cleared successfully!'
    });
  } catch (error) {
    console.error('Clear error:', error);
    return Response.json(
      {
        error:
          'Failed to clear data: ' +
          (error instanceof Error ? error.message : String(error))
      },
      { status: 500 }
    );
  }
}
