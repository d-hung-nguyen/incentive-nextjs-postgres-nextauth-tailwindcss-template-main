import 'server-only';

import { neon } from '@neondatabase/serverless';
import { count, eq, ilike } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

// Handle missing POSTGRES_URL during build
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV !== 'production') {
  console.warn(
    'No database connection string found. Some features may not work.'
  );
}

export const db = connectionString ? drizzle(neon(connectionString)) : null;

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'verified',
  'rejected',
  'redeemed'
]);

// --- agencies ---
export const agencies = pgTable('agencies', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  regionId: uuid('region_id'),
  status: text('status')
    .$type<'pending' | 'active' | 'archived'>()
    .default('pending'),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  zipCode: text('zip_code'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// --- agents ---
export const agents = pgTable('agents', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  role: text('role')
    .$type<'agent' | 'hotel_admin' | 'regional_admin' | 'global_admin'>()
    .default('agent')
    .notNull(),
  agencyId: uuid('agency_id'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  telephone: varchar('telephone', { length: 255 }),
  status: text('status')
    .$type<'pending' | 'active' | 'disabled'>()
    .default('pending')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// --- hotels ---
export const hotels = pgTable('hotels', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  country: text('country'),
  status: text('status')
    .$type<'active' | 'inactive' | 'archived'>()
    .default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// --- room types ---
export const roomTypes = pgTable('room_types', {
  id: uuid('id').primaryKey(),
  hotelId: uuid('hotel_id').notNull(),
  name: text('name').notNull(), // e.g., "Standard", "Deluxe", "Suite"
  pointsFactor: numeric('points_factor', { precision: 3, scale: 1 }).default(
    '1.0'
  ),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// --- bookings ---
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey(),
  agentId: uuid('agent_id').notNull(),
  hotelId: uuid('hotel_id').notNull(),
  roomTypeId: uuid('room_type_id').notNull(),
  guestName: text('guest_name').notNull(),
  arrivalDate: date('arrival_date').notNull(),
  numberOfNights: integer('number_of_nights').notNull(),
  points: integer('points').notNull(),
  yourRef: text('your_ref'), // Agent's reference number
  hotelRef: text('hotel_ref'), // Hotel's reference number
  status: text('status')
    .$type<'pending' | 'verified' | 'rejected' | 'redeemed'>()
    .default('pending')
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export type SelectBooking = typeof bookings.$inferSelect;
export const insertBookingSchema = createInsertSchema(bookings);

// --- products (keep for compatibility) ---
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});

export type SelectProduct = typeof products.$inferSelect;
export const insertProductSchema = createInsertSchema(products);

// --- booking functions ---
export async function getBookings(
  search: string,
  offset: number
): Promise<{
  bookings: (SelectBooking & {
    hotelName: string;
    roomTypeName: string;
    agentName: string;
  })[];
  newOffset: number | null;
  totalBookings: number;
}> {
  if (!db) {
    return { bookings: [], newOffset: null, totalBookings: 0 };
  }

  // Search bookings with joins
  if (search) {
    const searchResults = await db
      .select({
        id: bookings.id,
        agentId: bookings.agentId,
        hotelId: bookings.hotelId,
        roomTypeId: bookings.roomTypeId,
        guestName: bookings.guestName,
        arrivalDate: bookings.arrivalDate,
        numberOfNights: bookings.numberOfNights,
        points: bookings.points,
        yourRef: bookings.yourRef,
        hotelRef: bookings.hotelRef,
        status: bookings.status,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        hotelName: hotels.name,
        roomTypeName: roomTypes.name,
        agentName: agents.firstName
      })
      .from(bookings)
      .leftJoin(hotels, eq(bookings.hotelId, hotels.id))
      .leftJoin(roomTypes, eq(bookings.roomTypeId, roomTypes.id))
      .leftJoin(agents, eq(bookings.agentId, agents.id))
      .where(ilike(bookings.guestName, `%${search}%`))
      .limit(1000);

    return {
      bookings: searchResults.map((row) => ({
        ...row,
        hotelName: row.hotelName || 'Unknown Hotel',
        roomTypeName: row.roomTypeName || 'Unknown Room',
        agentName: row.agentName || 'Unknown Agent'
      })),
      newOffset: null,
      totalBookings: 0
    };
  }

  if (offset === null) {
    return { bookings: [], newOffset: null, totalBookings: 0 };
  }

  let totalBookings = await db.select({ count: count() }).from(bookings);
  let moreBookings = await db
    .select({
      id: bookings.id,
      agentId: bookings.agentId,
      hotelId: bookings.hotelId,
      roomTypeId: bookings.roomTypeId,
      guestName: bookings.guestName,
      arrivalDate: bookings.arrivalDate,
      numberOfNights: bookings.numberOfNights,
      points: bookings.points,
      yourRef: bookings.yourRef,
      hotelRef: bookings.hotelRef,
      status: bookings.status,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      hotelName: hotels.name,
      roomTypeName: roomTypes.name,
      agentName: agents.firstName
    })
    .from(bookings)
    .leftJoin(hotels, eq(bookings.hotelId, hotels.id))
    .leftJoin(roomTypes, eq(bookings.roomTypeId, roomTypes.id))
    .leftJoin(agents, eq(bookings.agentId, agents.id))
    .limit(5)
    .offset(offset);

  let newOffset = moreBookings.length >= 5 ? offset + 5 : null;

  return {
    bookings: moreBookings.map((row) => ({
      ...row,
      hotelName: row.hotelName || 'Unknown Hotel',
      roomTypeName: row.roomTypeName || 'Unknown Room',
      agentName: row.agentName || 'Unknown Agent'
    })),
    newOffset,
    totalBookings: totalBookings[0].count
  };
}

export async function deleteBookingById(id: string) {
  if (!db) {
    console.warn('No database connection available for deleteBookingById');
    return;
  }
  await db.delete(bookings).where(eq(bookings.id, id));
}

// Keep product functions for compatibility
export async function getProducts(
  search: string,
  offset: number
): Promise<{
  products: SelectProduct[];
  newOffset: number | null;
  totalProducts: number;
}> {
  if (!db) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  if (search) {
    return {
      products: await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  let totalProducts = await db.select({ count: count() }).from(products);
  let moreProducts = await db.select().from(products).limit(5).offset(offset);
  let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts: totalProducts[0].count
  };
}

export async function deleteProductById(id: number) {
  if (!db) {
    console.warn('No database connection available for deleteProductById');
    return;
  }
  await db.delete(products).where(eq(products.id, id));
}
