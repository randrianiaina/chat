import { pgTable, serial, text, timestamp, pgEnum, integer, varchar } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('role', ['ADMIN', 'MODERATOR', 'CLIENT']);
export const itemStatus = pgEnum('status', ['pending', 'approved', 'rejected']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerkId').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: userRole('role').default('CLIENT'),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  name: text('name'),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversationId').references(() => conversations.id),
  userId: integer('userId').references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const conversationParticipants = pgTable('conversation_participants', {
  conversationId: integer('conversationId').references(() => conversations.id),
  userId: integer('userId').references(() => users.id),
});

export const portfolioItems = pgTable('portfolio_items', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 256 }).notNull(),
    description: text('description').notNull(),
    imageUrl: text('imageUrl'),
    projectUrl: text('projectUrl'),
    status: itemStatus('status').default('pending').notNull(),
    userId: integer('userId').references(() => users.id),
    createdAt: timestamp('createdAt').defaultNow(),
});
