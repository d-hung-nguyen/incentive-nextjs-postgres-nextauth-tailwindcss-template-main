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
import { useRouter, useSearchParams } from 'next/navigation';
import { Booking } from './booking';

type BookingWithDetails = SelectBooking & {
  hotelName: string;
  roomTypeName: string;
  agentName: string;
};

export function BookingsTable({
  bookings,
  offset,
  totalBookings,
  currentStatus
}: {
  bookings: BookingWithDetails[];
  offset: number;
  totalBookings: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingsPerPage = 5;

  function prevPage() {
    const params = new URLSearchParams(searchParams);
    const newOffset = Math.max(0, offset - bookingsPerPage);
    params.set('offset', newOffset.toString());
    if (currentStatus !== 'all') {
      params.set('status', currentStatus);
    }
    router.push(`/?${params.toString()}`);
  }

  function nextPage() {
    const params = new URLSearchParams(searchParams);
    const newOffset = offset + bookingsPerPage;
    params.set('offset', newOffset.toString());
    if (currentStatus !== 'all') {
      params.set('status', currentStatus);
    }
    router.push(`/?${params.toString()}`);
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
              <TableHead className="py-4">Hotel Name</TableHead>
              <TableHead className="py-4">Guest Name</TableHead>
              <TableHead className="hidden md:table-cell py-4">
                Arrival
              </TableHead>
              <TableHead className="hidden md:table-cell py-4">
                Nights
              </TableHead>
              <TableHead className="hidden lg:table-cell py-4">
                Room Type
              </TableHead>
              <TableHead className="hidden lg:table-cell py-4">
                Points
              </TableHead>
              <TableHead className="hidden xl:table-cell py-4">
                Your Ref
              </TableHead>
              <TableHead className="hidden xl:table-cell py-4">
                Hotel Ref
              </TableHead>
              <TableHead className="py-4">Status</TableHead>
              <TableHead className="w-[100px] py-4">Actions</TableHead>
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
        <div className="flex items-center w-full justify-between">
          <div className="text-left">
            <div className="text-sm text-muted-foreground">
              Showing {Math.max(1, offset - bookingsPerPage + 1)}-
              {Math.min(offset, totalBookings)} of {totalBookings} bookings
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={prevPage}
              variant="ghost"
              size="sm"
              disabled={offset <= bookingsPerPage}
              className="flex items-center gap-2 px-4 py-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={nextPage}
              variant="ghost"
              size="sm"
              disabled={offset >= totalBookings}
              className="flex items-center gap-2 px-4 py-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
