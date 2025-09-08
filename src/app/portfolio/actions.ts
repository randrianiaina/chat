'use server';

import { db } from '@/lib/db';
import { portfolioItems, users } from '@/lib/db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitPortfolioItem(formData: FormData) {
  const user = await currentUser();

  if (!user) {
    throw new Error('You must be logged in to submit an item.');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const projectUrl = formData.get('projectUrl') as string;

  if (!title || !description) {
    throw new Error('Title and description are required.');
  }
  
  // Find the internal user ID from the users table based on the Clerk user ID
  const dbUsers = await db.select().from(users).where(eq(users.clerkId, user.id));

  if (dbUsers.length === 0) {
    throw new Error('User not found in the database. Please sign up properly.');
  }
  const dbUser = dbUsers[0];

  await db.insert(portfolioItems).values({
    title,
    description,
    imageUrl,
    projectUrl,
    userId: dbUser.id,
  });

  revalidatePath('/admin'); // Revalidate the admin page to show the new item
  revalidatePath('/portfolio'); // Revalidate the future public portfolio page
  redirect('/portfolio/submit?success=true'); // Redirect with a success message
}
