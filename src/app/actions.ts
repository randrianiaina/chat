'use server';

import { db as firestoreDb } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc, deleteField } from "firebase/firestore"; 
import { auth } from '@clerk/nextjs/server';
import { db as drizzleDb } from '@/lib/firebase'; // Corrected import
import { users, conversations as conversationsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function sendMessage(conversationId: number, content: string) {
  const { userId: clerkId } = auth();

  if (!clerkId) {
    throw new Error('User not authenticated');
  }

  const [user] = await drizzleDb.select().from(users).where(eq(users.clerkId, clerkId));

  if (!user) {
    throw new Error('User not found');
  }

  await addDoc(collection(firestoreDb, "messages"), {
    conversationId: conversationId,
    content: content,
    createdAt: serverTimestamp(),
    authorName: user.name,
    authorEmail: user.email,
    authorClerkId: clerkId
  });
  
  // When a message is sent, the user is no longer typing
  await updateTypingStatus(conversationId, false);
}

export async function createConversation(name: string) {
    const { userId: clerkId } = auth();

    if (!clerkId) {
        throw new Error('User not authenticated');
    }

    const [user] = await drizzleDb.select().from(users).where(eq(users.clerkId, clerkId));

    if (!user) {
        throw new Error('User not found');
    }

    const [newConversation] = await drizzleDb
        .insert(conversationsTable)
        .values({ name, creatorId: user.id })
        .returning();

    revalidatePath('/api/conversations');

    return newConversation;
}

export async function updateTypingStatus(conversationId: number, isTyping: boolean) {
    const { userId: clerkId } = auth();

    if (!clerkId) {
        // Don't throw error, just exit silently if user is not logged in.
        return;
    }

    const [user] = await drizzleDb.select().from(users).where(eq(users.clerkId, clerkId));

    if (!user) {
        return;
    }

    const typingRef = doc(firestoreDb, 'typing', conversationId.toString());

    if (isTyping) {
        await setDoc(typingRef, {
            [clerkId]: {
                name: user.name,
                timestamp: serverTimestamp()
            }
        }, { merge: true });
    } else {
        await updateDoc(typingRef, {
            [clerkId]: deleteField()
        }).catch(err => {
            // It's okay if the document or field doesn't exist.
            if (err.code !== 'not-found') {
                console.error("Failed to delete typing status:", err);
            }
        });
    }
}
