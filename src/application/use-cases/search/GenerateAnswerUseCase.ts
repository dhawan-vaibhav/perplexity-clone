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

    try {
      let chunkCount = 0;
      
      for await (const chunk of this.llmService.generateAnswer(query, searchResults, {
        model: modelKey,
        ...options
      })) {
        chunkCount++;
        yield chunk;
      }
      
    } catch (error) {
      console.error('GenerateAnswerUseCase error:', error);
      throw error;
    }
  }
}