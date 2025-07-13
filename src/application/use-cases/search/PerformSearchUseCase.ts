import { SearchResult } from '../../../entities/models/thread-item';
import { SearchProvider } from '../../../entities/models/search-query';
import { ISearchEngineService } from '../../services/ISearchEngineService';

export class PerformSearchUseCase {
  constructor(private searchEngineService: ISearchEngineService) {}

  async* execute(query: string, searchProvider?: SearchProvider): AsyncGenerator<SearchResult, void, unknown> {
    for await (const result of this.searchEngineService.search(query, searchProvider)) {
      yield result;
    }
  }
}