import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

const createPublicId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 10);

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  publicId: text('public_id').notNull().unique().$default(() => createPublicId()),
  name: text('name').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).$default(() => new Date()),
});

export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  publicId: text('public_id').notNull().unique().$default(() => createPublicId()),
  studentName: text('student_name').notNull(),
  activityId: text('activity_id').notNull(),
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  metadata: text('metadata'), // JSON string for mode, systemPrompt, constraints, etc.
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).$default(() => new Date()),
});

export const gandalfSessions = sqliteTable('gandalf_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  publicId: text('public_id').notNull().unique().$default(() => createPublicId()),
  studentName: text('student_name').notNull(),
  activityId: text('activity_id').notNull(),
  currentLevel: integer('current_level').notNull().$default(() => 1),
  status: text('status').notNull().$default(() => 'active'),
  secrets: text('secrets').notNull(),
  attemptCounts: text('attempt_counts').notNull(),
  history: text('history').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).$default(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).$default(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});