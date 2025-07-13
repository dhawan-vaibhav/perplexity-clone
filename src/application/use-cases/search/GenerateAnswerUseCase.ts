import { SearchResult } from '../../../entities/models/thread-item';
import { ILLMService } from '../../services/ILLMService';

export class GenerateAnswerUseCase {
  constructor(private llmService: ILLMService) {}

  async *execute(
    query: string,
    searchResults: SearchResult[],
    modelKey?: string,
    options?: { temperature?: number }
  ): AsyncGenerator<string, void, unknown> {
    console.log('GenerateAnswerUseCase.execute called with:', {
      query,
      searchResultsCount: searchResults.length,
      modelKey,
      options,
      llmServiceExists: !!this.llmService
    });

    try {
      console.log('Calling llmService.generateAnswer...');
      let chunkCount = 0;
      
      for await (const chunk of this.llmService.generateAnswer(query, searchResults, {
        model: modelKey,
        ...options
      })) {
        chunkCount++;
        console.log(`GenerateAnswerUseCase yielding chunk ${chunkCount}:`, chunk);
        yield chunk;
      }
      
      console.log('GenerateAnswerUseCase completed. Total chunks:', chunkCount);
    } catch (error) {
      console.error('GenerateAnswerUseCase error:', error);
      throw error;
    }
  }
}