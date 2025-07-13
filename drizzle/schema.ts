import { pgTable, uuid, text, timestamp, jsonb, boolean, unique } from 'drizzle-orm/pg-core';

export const threads = pgTable('threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id'),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const threadItems = pgTable('thread_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
  userId: text('user_id'),
  query: text('query').notNull(),
  searchResults: jsonb('search_results'),
  llmResponse: text('llm_response'),
  isComplete: boolean('is_complete').default(false),
  citations: jsonb('citations'),
  vocabulary: jsonb('vocabulary'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vocabularyEntries = pgTable('vocabulary_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  word: text('word').notNull(),
  threadItemId: uuid('thread_item_id').notNull().references(() => threadItems.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  content: jsonb('content').notNull(), // {pronunciation, definition, examples, synonyms, etc.}
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueWordThreadItem: unique().on(table.word, table.threadItemId),
}));