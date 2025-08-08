import { Button } from '@/components/ui/button';
import { getBookingsByStatus } from '@/lib/db';
import { File, PlusCircle } from 'lucide-react';
import { BookingsTable } from './bookings-table';
import { BookingsTabs } from './bookings-tabs';

export default async function BookingsPage(props: {
  searchParams: Promise<{ q: string; offset: string; status: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  const status = searchParams.status ?? 'all';

  const { bookings, newOffset, totalBookings } = await getBookingsByStatus(
    search,
    Number(offset),
    status
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <BookingsTabs currentStatus={status} />
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Booking
            </span>
          </Button>
        </div>
      </div>

      <BookingsTable
        bookings={bookings}
        offset={newOffset ?? 0}
        totalBookings={totalBookings}
        currentStatus={status}
      />
    </div>
  );
}
