import { z } from 'zod';

export const threadSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string().min(1).max(200),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Thread = z.infer<typeof threadSchema>;

export const createThreadSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(200),
});

export type CreateThread = z.infer<typeof createThreadSchema>;