// src/interface-adapters/controllers/SearchController.ts (Updated with Citations)
import { z } from 'zod';
import { SearchQuery, searchQuerySchema } from '../../entities/models/search-query';
import { Thread } from '../../entities/models/thread';
import { ThreadItem, SearchResult, Citation, VocabularyWord } from '../../entities/models/thread-item';
import { InputParseError } from '../../entities/errors/common';
import { CreateThreadUseCase } from '../../application/use-cases/search/CreateThreadUseCase';
import { PerformSearchUseCase } from '../../application/use-cases/search/PerformSearchUseCase';
import { GenerateAnswerUseCase } from '../../application/use-cases/search/GenerateAnswerUseCase';
import { ManageThreadItemUseCase } from '../../application/use-cases/search/ManageThreadItemUseCase';
import { CitationExtractionService } from '../../infrastructure/services/citation-service';

function presenter() {
  return {
    formatThreadCreated: (thread: Thread) => ({
      type: 'thread_created' as const,
      data: {
        threadId: thread.id,
        title: thread.title,
        createdAt: thread.createdAt.toISOString(),
      },
    }),

    formatSearchResult: (result: SearchResult) => ({
      type: 'search_result' as const,
      data: {
        url: result.url,
        title: result.title,
        snippet: result.snippet,
        favicon: result.favicon,
      },
    }),

    formatLLMChunk: (chunk: string) => ({
      type: 'llm_chunk' as const,
      data: chunk,
    }),

    formatCitations: (citations: Citation[]) => ({
      type: 'citations' as const,
      data: citations,
    }),

    formatVocabulary: (vocabulary: VocabularyWord[]) => ({
      type: 'vocabulary' as const,
      data: vocabulary,
    }),

    formatComplete: (threadItem: ThreadItem) => ({
      type: 'complete' as const,
      data: {
        threadItemId: threadItem.id,
        threadId: threadItem.threadId,
        isComplete: threadItem.isComplete,
      },
    }),

    formatError: (error: Error) => ({
      type: 'error' as const,
      data: {
        message: error.message,
      },
    }),
  };
}

const inputSchema = searchQuerySchema;

export type ISearchController = ReturnType<typeof createSearchController>;

export const createSearchController =
  (
    createThreadUseCase: CreateThreadUseCase,
    performSearchUseCase: PerformSearchUseCase,
    generateAnswerUseCase: GenerateAnswerUseCase,
    manageThreadItemUseCase: ManageThreadItemUseCase,
    citationExtractionService: CitationExtractionService,
  ) =>
  async function* (
    input: Partial<z.infer<typeof inputSchema>>,
  ): AsyncGenerator<unknown, void, unknown> {
    
    const format = presenter();
    
    try {
      // Input validation
      const { data, error: inputParseError } = inputSchema.safeParse(input);
      
      if (inputParseError) {
        yield format.formatError(new InputParseError('Invalid search query', { cause: inputParseError }));
        return;
      }

      const searchQuery: SearchQuery = data;

      // Step 1: Create or use existing thread
      let threadId = searchQuery.threadId;
      
      if (!threadId) {
        if (!searchQuery.userId) {
          yield format.formatError(new Error('userId is required for creating new threads'));
          return;
        }
        const thread = await createThreadUseCase.execute(searchQuery.query, searchQuery.userId);
        threadId = thread.id;
        yield format.formatThreadCreated(thread);
      }

      // Step 2: Create thread item
      const threadItem = await manageThreadItemUseCase.createItem(threadId, searchQuery.query);

      // Step 3: Perform search (streaming individual results)
      const searchResults: SearchResult[] = [];

      for await (const searchResult of performSearchUseCase.execute(searchQuery.query, searchQuery.searchProvider)) {
        searchResults.push(searchResult);
        yield format.formatSearchResult(searchResult);
      }

      await manageThreadItemUseCase.updateWithSearchResults(threadItem.id, searchResults);

      // Step 4: Generate LLM response (streaming)
      let fullResponse = '';
      
      try {
        for await (const chunk of generateAnswerUseCase.execute(
          searchQuery.query, 
          searchResults, 
          searchQuery.llmModel,
          searchQuery.llmOptions
        )) {
          fullResponse += chunk;
          yield format.formatLLMChunk(chunk);
        }

        // Step 5: Extract citations from response
        const citations = citationExtractionService.extractCitations(fullResponse, searchResults);

        // Step 6: Complete thread item with citations
        const completedItem = await manageThreadItemUseCase.completeItemWithCitations(
          threadItem.id, 
          fullResponse,
          citations
        );

        // Step 7: Send citations to frontend
        if (citations.length > 0) {
          yield format.formatCitations(citations);
        }

        // Step 8: Send completion
        yield format.formatComplete(completedItem);

      } catch (llmError) {
        // Simple error handling - just pass through the error message
        const errorMessage = llmError instanceof Error ? llmError.message : 'LLM generation failed';
        yield format.formatError(new Error(errorMessage));
        return;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      yield format.formatError(new Error(errorMessage));
    }
  };