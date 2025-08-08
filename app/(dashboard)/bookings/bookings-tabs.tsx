'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface BookingsTabsProps {
  currentStatus: string;
}

function BookingsTabsContent({ currentStatus }: BookingsTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', value);
    params.delete('offset'); // Reset pagination when changing tabs
    router.push(`/bookings?${params.toString()}`);
  };

  return (
    <Tabs
      value={currentStatus || 'all'}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-5 max-w-[500px]">
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
    </Tabs>
  );
}

export function BookingsTabs({ currentStatus }: BookingsTabsProps) {
  return (
    <Suspense fallback={<div>Loading tabs...</div>}>
      <BookingsTabsContent currentStatus={currentStatus} />
    </Suspense>
  );
}
