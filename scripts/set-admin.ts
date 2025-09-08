require('dotenv').config({ path: '.env.local' });

const Clerk = require('@clerk/clerk-sdk-node');

// Initialize the Clerk client
const clerk = new Clerk.Clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const userId = 'user_32PPMegYVHSX2WNaG0qT8vQgquh';
const role = 'admin';

async function setAdmin() {
  try {
    console.log(`Attempting to set role '${role}' for user ${userId}...`);
    
    const response = await clerk.users.updateUser(userId, {
      publicMetadata: {
        role: role,
      },
    });

    console.log('Successfully updated user metadata.');
    console.log(`User ${userId} is now an ${role}.`);
    console.log('Full response:', JSON.stringify(response, null, 2));

  } catch (error: any) {
    console.error('Error updating user metadata:');
    if (error.errors) {
      console.error(JSON.stringify(error.errors, null, 2));
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

setAdmin();
