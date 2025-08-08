'use server';

import { deleteBookingById, deleteProductById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteBooking(formData: FormData) {
  let id = formData.get('id') as string;
  await deleteBookingById(id);
  revalidatePath('/');
}

export async function deleteProduct(formData: FormData) {
  let id = Number(formData.get('id'));
  await deleteProductById(id);
  revalidatePath('/');
}
