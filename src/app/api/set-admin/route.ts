import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId, role, secret } = await req.json();

  // 1. Secret Key Validation
  const adminCreationSecret = process.env.ADMIN_CREATION_SECRET;
  if (!adminCreationSecret || secret !== adminCreationSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Input Validation
  if (!userId || !role) {
    return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
  }

  // 3. Update User Metadata
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });
    return NextResponse.json({ success: true, message: `User ${userId} is now an ${role}.` });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
