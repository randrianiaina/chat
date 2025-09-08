'use server';

import { db as firestoreDb } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, updateDoc, deleteField, runTransaction, deleteDoc } from "firebase/firestore"; 
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

export async function addReaction(messageId: string, emoji: string) {
    const { userId: clerkId } = auth();
    if (!clerkId) {
        throw new Error('User not authenticated');
    }

    const [user] = await drizzleDb.select().from(users).where(eq(users.clerkId, clerkId));
    if (!user) {
        throw new Error('User not found');
    }

    const reactionRef = doc(firestoreDb, "reactions", messageId);

    await runTransaction(firestoreDb, async (transaction) => {
        const reactionDoc = await transaction.get(reactionRef);

        if (!reactionDoc.exists()) {
            transaction.set(reactionRef, { 
                [emoji]: { 
                    count: 1,
                    users: { [clerkId]: user.name }
                }
            });
        } else {
            const reactions = reactionDoc.data();
            const existingReaction = reactions[emoji];

            if (existingReaction) {
                const userHasReacted = existingReaction.users[clerkId];

                if (userHasReacted) {
                    // User is removing their reaction
                    const newCount = existingReaction.count - 1;
                    const newUsers = { ...existingReaction.users };
                    delete newUsers[clerkId];

                    if (newCount === 0) {
                        transaction.update(reactionRef, { [emoji]: deleteField() });
                    } else {
                        transaction.update(reactionRef, { 
                            [emoji]: { 
                                count: newCount, 
                                users: newUsers 
                            }
                        });
                    }
                } else {
                    // User is adding a new reaction
                    transaction.update(reactionRef, {
                        [emoji]: {
                            count: existingReaction.count + 1,
                            users: { ...existingReaction.users, [clerkId]: user.name }
                        }
                    });
                }
            } else {
                // Emoji does not exist, so add it
                transaction.update(reactionRef, {
                    [emoji]: {
                        count: 1,
                        users: { [clerkId]: user.name }
                    }
                });
            }
        }
    });
}

export async function updateMessage(messageId: string, content: string) {
    const { userId: clerkId } = auth();
    if (!clerkId) {
        throw new Error('User not authenticated');
    }

    const messageRef = doc(firestoreDb, "messages", messageId);
    // You might want to add a check to ensure the user is the author of the message
    await updateDoc(messageRef, { content });
}

export async function deleteMessage(messageId: string) {
    const { userId: clerkId } = auth();
    if (!clerkId) {
        throw new Error('User not authenticated');
    }

    const messageRef = doc(firestoreDb, "messages", messageId);
    // You might want to add a check to ensure the user is the author of the message
    await deleteDoc(messageRef);
}
