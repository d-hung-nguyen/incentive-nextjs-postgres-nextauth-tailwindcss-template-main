'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { SelectBooking } from '@/lib/db';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { BookingDetailsModal } from './booking-details-modal';

type BookingWithDetails = SelectBooking & {
  hotelName: string;
  roomTypeName: string;
  agentName: string;
};

export function Booking({ booking }: { booking: BookingWithDetails }) {
  const [showModal, setShowModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'redeemed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{booking.hotelName}</TableCell>
        <TableCell>{booking.guestName}</TableCell>
        <TableCell className="hidden md:table-cell">
          {booking.arrivalDate
            ? new Date(booking.arrivalDate).toLocaleDateString('en-US')
            : '-'}
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {booking.numberOfNights}
        </TableCell>
        <TableCell className="hidden lg:table-cell">
          {booking.roomTypeName}
        </TableCell>
        <TableCell className="hidden lg:table-cell">{booking.points}</TableCell>
        <TableCell className="hidden xl:table-cell">
          {booking.yourRef || '-'}
        </TableCell>
        <TableCell className="hidden xl:table-cell">
          {booking.hotelRef || '-'}
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className={`capitalize ${getStatusColor(booking.status)}`}
          >
            {booking.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Button
            onClick={() => setShowModal(true)}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View details</span>
          </Button>
        </TableCell>
      </TableRow>

      <BookingDetailsModal
        booking={booking}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
