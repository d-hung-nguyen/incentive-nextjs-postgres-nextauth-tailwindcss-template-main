'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { SelectBooking } from '@/lib/db';
import { Bed, Building2, Calendar, Hash, User } from 'lucide-react';
import { deleteBooking } from './actions';

type BookingWithDetails = SelectBooking & {
  hotelName: string;
  roomTypeName: string;
  agentName: string;
};

interface BookingDetailsModalProps {
  booking: BookingWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose
}: BookingDetailsModalProps) {
  if (!booking) return null;

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

  const handleDelete = async () => {
    const formData = new FormData();
    formData.append('id', booking.id);
    await deleteBooking(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Booking Details
          </DialogTitle>
          <DialogDescription>
            Complete information for booking ID: {booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Status
              </label>
              <Badge
                variant="outline"
                className={`capitalize w-fit ${getStatusColor(booking.status)}`}
              >
                {booking.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Points Earned
              </label>
              <div className="text-2xl font-bold text-blue-600">
                {booking.points}
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Guest Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Guest Name
                </label>
                <div className="text-sm">{booking.guestName}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Agent
                </label>
                <div className="text-sm">
                  {booking.agentName || 'Unknown Agent'}
                </div>
              </div>
            </div>
          </div>

          {/* Hotel Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Hotel Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Hotel Name
                </label>
                <div className="text-sm font-medium">{booking.hotelName}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Room Type
                </label>
                <div className="text-sm flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  {booking.roomTypeName}
                </div>
              </div>
            </div>
          </div>

          {/* Stay Information */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Stay Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Arrival Date
                </label>
                <div className="text-sm">
                  {booking.arrivalDate
                    ? new Date(booking.arrivalDate).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }
                      )
                    : 'Not specified'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Number of Nights
                </label>
                <div className="text-sm">{booking.numberOfNights} nights</div>
              </div>
            </div>
          </div>

          {/* Reference Numbers */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Reference Numbers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Your Reference
                </label>
                <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {booking.yourRef || 'Not provided'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Hotel Reference
                </label>
                <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {booking.hotelRef || 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-gray-600">Booking History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Created
                </label>
                <div className="text-sm">
                  {booking.createdAt
                    ? new Date(booking.createdAt).toLocaleString('en-US')
                    : 'Unknown'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Last Updated
                </label>
                <div className="text-sm">
                  {booking.updatedAt
                    ? new Date(booking.updatedAt).toLocaleString('en-US')
                    : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline">Edit Booking</Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
