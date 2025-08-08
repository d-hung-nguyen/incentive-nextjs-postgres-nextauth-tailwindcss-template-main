import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getBookings } from '@/lib/db';
import { File, PlusCircle } from 'lucide-react';
import { BookingsTable } from './bookings-table';

export default async function BookingsPage(props: {
  searchParams: Promise<{ q: string; offset: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  const { bookings, newOffset, totalBookings } = await getBookings(
    search,
    Number(offset)
  );

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected" className="hidden sm:flex">
            Rejected
          </TabsTrigger>
          <TabsTrigger value="redeemed" className="hidden sm:flex">
            Redeemed
          </TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Booking
            </span>
          </Button>
        </div>
      </div>
      <TabsContent value="all">
        <BookingsTable
          bookings={bookings}
          offset={newOffset ?? 0}
          totalBookings={totalBookings}
        />
      </TabsContent>
    </Tabs>
  );
}
