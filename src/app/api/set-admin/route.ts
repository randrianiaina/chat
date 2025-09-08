import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId, role } = await req.json();

  if (!userId || !role) {
    return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
  }

  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
