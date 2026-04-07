import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

const createPublicId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 10);

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  publicId: text('public_id').notNull().unique().$default(() => createPublicId()),
  name: text('name').notNull().unique(),
  password: text('password').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).$default(() => new Date()),
});