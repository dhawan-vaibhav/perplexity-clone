import { z } from 'zod';
import { ThreadItem } from '../../entities/models/thread-item';
import { InputParseError } from '../../entities/errors/common';
import { GetThreadItemsUseCase } from '../../application/use-cases/search/GetThreadItemsUseCase';

function presenter() {
  return {
    formatThreadItems: (threadItems: ThreadItem[]) => ({
      type: 'thread_items' as const,
      data: threadItems.map(item => ({
        id: item.id,
        threadId: item.threadId,
        query: item.query,
        searchResults: item.searchResults || [],
        llmResponse: item.llmResponse || null,
        citations: item.citations || [],
        isComplete: item.isComplete,
        createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      })),
    }),

    formatError: (error: Error) => ({
      type: 'error' as const,
      data: {
        message: error.message,
      },
    }),
  };
}

const inputSchema = z.object({
  threadId: z.string().uuid(),
});

export type IThreadItemsController = ReturnType<typeof createThreadItemsController>;

export const createThreadItemsController =
  (getThreadItemsUseCase: GetThreadItemsUseCase) =>
  async (input: Partial<z.infer<typeof inputSchema>>) => {
    const format = presenter();
    
    try {
      // Input validation
      const { data, error: inputParseError } = inputSchema.safeParse(input);
      
      if (inputParseError) {
        return format.formatError(new InputParseError('Invalid threadId', { cause: inputParseError }));
      }

      const { threadId } = data;

      // Get thread items
      const threadItems = await getThreadItemsUseCase.execute(threadId);

      return format.formatThreadItems(threadItems);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return format.formatError(new Error(errorMessage));
    }
  };