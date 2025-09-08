'use server';

import { db } from '@/lib/db';
import { portfolioItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateItemStatus(itemId: number, status: 'approved' | 'rejected') {
  await db.update(portfolioItems)
    .set({ status: status })
    .where(eq(portfolioItems.id, itemId));

  revalidatePath('/admin');
}
