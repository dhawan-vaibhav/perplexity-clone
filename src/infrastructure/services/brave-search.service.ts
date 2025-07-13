import { SearchResult } from '../../entities/models/thread-item';
import { SearchProvider } from '../../entities/models/search-query';
import { ISearchEngineService } from '../../application/services/ISearchEngineService';

interface BraveSearchResponse {
  web?: {
    results?: Array<{
      url: string;
      title: string;
      description: string;
      favicon?: string;
    }>;
  };
}

export class BraveSearchService implements ISearchEngineService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.search.brave.com/res/v1/web/search';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async* search(
    query: string, 
    searchProvider?: SearchProvider,
    options?: { limit?: number; filters?: Record<string, string> }
  ): AsyncGenerator<SearchResult, void, unknown> {
    // For now, this service only handles Brave searches
    // The searchProvider parameter is accepted for interface compatibility
    const params = new URLSearchParams({
      q: query,
      count: (options?.limit || 10).toString(),
      safesearch: 'moderate',
      freshness: 'pw', // Past week for more recent results
      ...options?.filters,
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
    }

    const data: BraveSearchResponse = await response.json();

    if (!data.web?.results) {
      return;
    }

    // Stream results one by one
    for (const result of data.web.results) {
      yield {
        url: result.url,
        title: result.title,
        snippet: result.description,
        favicon: result.favicon,
      };
    }
  }
}