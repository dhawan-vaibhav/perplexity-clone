import { SearchResult } from '../../entities/models/thread-item';

export interface ILLMService {
  generateAnswer(
    query: string,
    searchResults: SearchResult[],
    options?: { model?: string; temperature?: number }
  ): AsyncGenerator<string, void, unknown>;
}