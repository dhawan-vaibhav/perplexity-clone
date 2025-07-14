import { z } from 'zod';

export const searchProviderSchema = z.enum(['brave', 'exa']);

// Simplified - just model selection now
export const searchQuerySchema = z.object({
  query: z.string().min(1).max(1000),
  threadId: z.string().uuid().optional(),
  userId: z.string().optional(),
  
  // Search provider
  searchProvider: searchProviderSchema.optional().default('brave'),
  
  // LLM model selection (unified)
  llmModel: z.string().optional().default('gemini-flash'),
  
  // Alternative field name for frontend compatibility
  model: z.string().optional(),
  
  // LLM options
  llmOptions: z.object({
    temperature: z.number().min(0).max(2).optional(),
  }).optional(),
}).transform((data) => ({
  ...data,
  // Use 'model' if provided, otherwise use 'llmModel'
  llmModel: data.model || data.llmModel,
}));

export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type SearchProvider = z.infer<typeof searchProviderSchema>