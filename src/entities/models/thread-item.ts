import { z } from 'zod';

export const vocabularyWordSchema = z.object({
  word: z.string(),
  position: z.number(),
  context: z.string(),
});

export type VocabularyWord = z.infer<typeof vocabularyWordSchema>;

export const citationSchema = z.object({
  sourceIndex: z.number().min(1),
  text: z.string().min(1),
  url: z.string().url(),
  title: z.string().min(1),
  snippet: z.string().optional(),
});

export type Citation = z.infer<typeof citationSchema>;

export const createCitationSchema = citationSchema;
export type CreateCitation = z.infer<typeof createCitationSchema>;

export const searchResultSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  snippet: z.string(),
  favicon: z.string().url().optional(),
});

export const threadItemSchema = z.object({
  id: z.string().uuid(),
  threadId: z.string().uuid(),
  query: z.string().min(1).max(1000),
  searchResults: z.array(searchResultSchema).optional(),
  llmResponse: z.string().optional(),
  citations: z.array(citationSchema).optional(),
  vocabulary: z.array(vocabularyWordSchema).optional(),
  isComplete: z.boolean().default(false),
  createdAt: z.date(),
});

export type ThreadItem = z.infer<typeof threadItemSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;

export const createThreadItemSchema = threadItemSchema.pick({
  threadId: true,
  query: true,
});

export type CreateThreadItem = z.infer<typeof createThreadItemSchema>;

export const updateThreadItemSchema = threadItemSchema
  .pick({
    searchResults: true,
    llmResponse: true,
    citations: true,
    vocabulary: true,
    isComplete: true,
  })
  .partial();

export type UpdateThreadItem = z.infer<typeof updateThreadItemSchema>;