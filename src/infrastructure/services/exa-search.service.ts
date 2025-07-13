import { SearchResult } from '../../entities/models/thread-item';
import { SearchProvider } from '../../entities/models/search-query';
import { ISearchEngineService } from '../../application/services/ISearchEngineService';

interface ExaSearchOptions {
  numResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  startCrawlDate?: string;
  endCrawlDate?: string;
  startPublishedDate?: string;
  endPublishedDate?: string;
  useAutoprompt?: boolean;
  type?: 'neural' | 'keyword';
  category?: 'company' | 'research paper' | 'news' | 'github' | 'tweet' | 'movie' | 'song' | 'personal site' | 'pdf';
}

interface ExaSearchResult {
  id: string;
  url: string;
  title: string;
  score: number;
  publishedDate?: string;
  author?: string;
  text?: string;
}

interface ExaResponse {
  results: ExaSearchResult[];
  autopromptString?: string;
}

export class ExaSearchService implements ISearchEngineService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.exa.ai/search';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async* search(
    query: string, 
    searchProvider?: SearchProvider,
    options?: { limit?: number; filters?: Record<string, string> }
  ): AsyncGenerator<SearchResult, void, unknown> {
    
    const exaOptions: ExaSearchOptions = {
      numResults: options?.limit || 10,
      useAutoprompt: true,
      type: 'neural', // Default to neural search for better semantic understanding
    };

    // Configure search based on filters
    if (options?.filters?.searchType === 'news') {
      exaOptions.category = 'news';
      exaOptions.startPublishedDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days
    } else if (options?.filters?.searchType === 'academic') {
      exaOptions.category = 'research paper';
      exaOptions.includeDomains = ['arxiv.org', 'scholar.google.com', 'pubmed.ncbi.nlm.nih.gov'];
    } else if (options?.filters?.searchType === 'github') {
      exaOptions.category = 'github';
      exaOptions.includeDomains = ['github.com'];
    }

    // Apply domain filters if specified
    if (options?.filters?.sites) {
      const sites = options.filters.sites.split(',').map(site => site.trim());
      exaOptions.includeDomains = sites;
    }

    const requestBody = {
      query,
      ...exaOptions,
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000), // 15 second timeout
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Exa API authentication failed. Check your API key.');
        } else if (response.status === 429) {
          throw new Error('Exa API rate limit exceeded. Please try again later.');
        }
        throw new Error(`Exa API error: ${response.status} ${response.statusText}`);
      }

      const data: ExaResponse = await response.json();

      if (!data.results || data.results.length === 0) {
        return;
      }

      // Stream results one by one
      for (const result of data.results) {
        yield {
          url: result.url,
          title: result.title,
          snippet: result.text || `Score: ${result.score.toFixed(2)}${result.author ? ` | Author: ${result.author}` : ''}`,
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(result.url).hostname}`,
        };
      }
    } catch (error) {
      console.error('Exa search error:', error);
      throw new Error(`Exa search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}