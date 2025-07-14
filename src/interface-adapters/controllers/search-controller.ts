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
        userId: thread.userId,
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
      const { data, error: inputParseError } = inputSchema.safeParse(input);
      
      if (inputParseError) {
        yield format.formatError(new InputParseError('Invalid search query', { cause: inputParseError }));
        return;
      }

      const searchQuery: SearchQuery = data;

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

      const threadItem = await manageThreadItemUseCase.createItem(threadId, searchQuery.query);

      const searchResults: SearchResult[] = [];

      for await (const searchResult of performSearchUseCase.execute(searchQuery.query, searchQuery.searchProvider)) {
        searchResults.push(searchResult);
        yield format.formatSearchResult(searchResult);
      }

      await manageThreadItemUseCase.updateWithSearchResults(threadItem.id, searchResults);

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

        const citations = citationExtractionService.extractCitations(fullResponse, searchResults);

        const vocabulary: VocabularyWord[] = [];
        
        const invisibleMarkerRegex = /(\b\w+)["\']?\u200C\u200D/g;
        let match;
        while ((match = invisibleMarkerRegex.exec(fullResponse)) !== null) {
          const word = match[1];
          vocabulary.push({
            word,
            position: match.index,
            context: fullResponse.substring(Math.max(0, match.index - 50), Math.min(fullResponse.length, match.index + 50))
          });
        }
        
        if (vocabulary.length === 0) {
          const bracketPattern = /(\b\w+)⟨ZWNJ⟩⟨ZWJ⟩/g;
          while ((match = bracketPattern.exec(fullResponse)) !== null) {
            const word = match[1];
            vocabulary.push({
              word,
              position: match.index,
              context: fullResponse.substring(Math.max(0, match.index - 50), Math.min(fullResponse.length, match.index + 50))
            });
          }
        }
        

        const completedItem = await manageThreadItemUseCase.completeItemWithCitationsAndVocabulary(
          threadItem.id, 
          fullResponse,
          citations,
          vocabulary
        );

        if (vocabulary.length > 0) {
          yield format.formatVocabulary(vocabulary);
        }

        if (citations.length > 0) {
          yield format.formatCitations(citations);
        }

        yield format.formatComplete(completedItem);

      } catch (llmError) {
        const errorMessage = llmError instanceof Error ? llmError.message : 'LLM generation failed';
        yield format.formatError(new Error(errorMessage));
        return;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      yield format.formatError(new Error(errorMessage));
    }
  };