import { SearchResult } from '../../entities/models/thread-item';
import { SearchProvider } from '../../entities/models/search-query';

export interface ISearchEngineService {
  search(query: string, searchProvider?: SearchProvider, options?: { limit?: number; filters?: Record<string, string> }): AsyncGenerator<SearchResult, void, unknown>;
}