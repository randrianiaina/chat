import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Corrected import
import { conversations, users, conversationParticipants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId: clerkId } = auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userConversations = await db
      .select({
        id: conversations.id,
        name: conversations.name,
        createdAt: conversations.createdAt,
        creatorId: conversations.creatorId,
      })
      .from(conversations)
      .innerJoin(
        conversationParticipants,
        eq(conversations.id, conversationParticipants.conversationId)
      )
      .innerJoin(
        users,
        eq(conversationParticipants.userId, users.id)
      )
      .where(eq(users.clerkId, clerkId))
      .orderBy(conversations.createdAt);

    return NextResponse.json(userConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
