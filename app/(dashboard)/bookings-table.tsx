'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { SelectBooking } from '@/lib/db';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Booking } from './booking';

type BookingWithDetails = SelectBooking & {
  hotelName: string;
  roomTypeName: string;
  agentName: string;
};

export function BookingsTable({
  bookings,
  offset,
  totalBookings
}: {
  bookings: BookingWithDetails[];
  offset: number;
  totalBookings: number;
}) {
  let router = useRouter();
  let bookingsPerPage = 5;

  function prevPage() {
    router.back();
  }

  function nextPage() {
    router.push(`/?offset=${offset}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>
          Manage hotel bookings and track their status. Click the eye icon to
          view details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hotel Name</TableHead>
              <TableHead>Guest Name</TableHead>
              <TableHead className="hidden md:table-cell">Arrival</TableHead>
              <TableHead className="hidden md:table-cell">
                No. of Nights
              </TableHead>
              <TableHead className="hidden lg:table-cell">Room Type</TableHead>
              <TableHead className="hidden lg:table-cell">Points</TableHead>
              <TableHead className="hidden xl:table-cell">Your Ref#</TableHead>
              <TableHead className="hidden xl:table-cell">Hotel Ref#</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <Booking key={booking.id} booking={booking} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
            Showing{' '}
            <strong>
              {Math.max(
                0,
                Math.min(offset - bookingsPerPage, totalBookings) + 1
              )}
              -{offset}
            </strong>{' '}
            of <strong>{totalBookings}</strong> bookings
          </div>
          <div className="flex">
            <Button
              formAction={prevPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset === bookingsPerPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Prev
            </Button>
            <Button
              formAction={nextPage}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={offset + bookingsPerPage > totalBookings}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
