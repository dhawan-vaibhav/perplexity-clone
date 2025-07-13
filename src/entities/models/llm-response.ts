import { z } from 'zod';

export const citationSchema = z.object({
  sourceIndex: z.number().min(1),
  text: z.string().min(1),
  url: z.string().url(),
});

export const llmResponseSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(citationSchema),
  confidence: z.enum(['high', 'medium', 'low']),
  limitations: z.string().optional(),
});

export type Citation = z.infer<typeof citationSchema>;
export type LLMResponse = z.infer<typeof llmResponseSchema>;

export const streamingResponseSchema = z.object({
  content: z.string(),
  isComplete: z.boolean().default(false),
});

export type StreamingResponse = z.infer<typeof streamingResponseSchema>;