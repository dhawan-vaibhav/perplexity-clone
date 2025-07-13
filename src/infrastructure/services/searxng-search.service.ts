import { SearchResult } from '../../entities/models/thread-item';
import { SearchProvider } from '../../entities/models/search-query';
import { ISearchEngineService } from '../../application/services/ISearchEngineService';

interface SearXNGSearchOptions {
  categories?: string[];
  engines?: string[];
  language?: string;
  pageno?: number;
}

interface SearXNGSearchResult {
  title: string;
  url: string;
  img_src?: string;
  thumbnail_src?: string;
  thumbnail?: string;
  content?: string;
  author?: string;
}

interface SearXNGResponse {
  results: SearXNGSearchResult[];
  suggestions: string[];
}

export class SearXNGSearchService implements ISearchEngineService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = process.env.SEARXNG_URL || 'http://localhost:32768') {
    this.baseUrl = baseUrl;
  }

  async* search(
    query: string, 
    searchProvider?: SearchProvider,
    options?: { limit?: number; filters?: Record<string, string> }
  ): AsyncGenerator<SearchResult, void, unknown> {
    
    const searxngOptions: SearXNGSearchOptions = {
      language: 'en',
      pageno: 1,
      ...options?.filters,
    };

    // Configure engines based on search type
    if (options?.filters?.searchType === 'news') {
      searxngOptions.engines = ['bing news', 'google news'];
    } else if (options?.filters?.searchType === 'academic') {
      searxngOptions.engines = ['arxiv', 'google scholar', 'pubmed'];
    } else if (options?.filters?.searchType === 'social') {
      searxngOptions.engines = ['reddit'];
    } else if (options?.filters?.searchType === 'video') {
      searxngOptions.engines = ['youtube'];
    } else {
      // Default to general web search with good coverage
      searxngOptions.engines = ['bing', 'google', 'duckduckgo'];
    }

    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.append('q', query);
    url.searchParams.append('format', 'json');
    
    Object.entries(searxngOptions).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        url.searchParams.append(key, value.join(','));
      } else if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Perplexity-Clone/1.0',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`SearXNG API error: ${response.status} ${response.statusText}`);
      }

      const data: SearXNGResponse = await response.json();

      if (!data.results || data.results.length === 0) {
        return;
      }

      // Limit results if specified
      const results = options?.limit ? data.results.slice(0, options.limit) : data.results;

      // Stream results one by one
      for (const result of results) {
        // Prioritize img_src for image searches, then thumbnail fields
        const imageUrl = result.img_src || result.thumbnail_src || result.thumbnail;
        
        yield {
          url: result.url,
          title: result.title,
          snippet: result.content || '',
          favicon: imageUrl,
        };
      }
    } catch (error) {
      console.error('SearXNG search error:', error);
      throw new Error(`SearXNG search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}