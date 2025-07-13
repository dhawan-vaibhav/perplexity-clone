import { SearchResult } from '../../entities/models/thread-item';
import { SearchProvider } from '../../entities/models/search-query';
import { ISearchEngineService } from '../../application/services/ISearchEngineService';
import { BraveSearchService } from './brave-search.service';
import { SearXNGSearchService } from './searxng-search.service';
import { ExaSearchService } from './exa-search.service';

export class CompositeSearchService implements ISearchEngineService {
  private readonly braveService: BraveSearchService;
  private readonly searxngService: SearXNGSearchService;
  private readonly exaService: ExaSearchService | null;

  constructor() {
    // Initialize services based on available configuration
    const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
    const exaApiKey = process.env.EXA_API_KEY;
    const searxngUrl = process.env.SEARXNG_URL;

    if (!braveApiKey) {
      throw new Error('BRAVE_SEARCH_API_KEY environment variable is required');
    }

    this.braveService = new BraveSearchService(braveApiKey);
    this.searxngService = new SearXNGSearchService(searxngUrl);
    this.exaService = exaApiKey ? new ExaSearchService(exaApiKey) : null;
  }

  async* search(
    query: string,
    searchProvider?: SearchProvider,
    options?: { limit?: number; filters?: Record<string, string> }
  ): AsyncGenerator<SearchResult, void, unknown> {
    
    // Default to brave if no provider specified
    const provider = searchProvider || 'brave';
    
    try {
      switch (provider) {
        case 'brave':
          yield* this.braveService.search(query, searchProvider, options);
          break;
          
        case 'searxng':
          yield* this.searxngService.search(query, searchProvider, options);
          break;
          
        case 'exa':
          if (this.exaService) {
            yield* this.exaService.search(query, searchProvider, options);
          } else {
            console.warn('Exa service not available (missing API key)');
            throw new Error('Exa search service is not available');
          }
          break;
          
        default:
          console.warn(`Unknown search provider: ${provider}, falling back to Brave`);
          yield* this.braveService.search(query, searchProvider, options);
      }
    } catch (error) {
      console.error(`Search failed with provider ${provider}:`, error);
      throw error; // Don't fall back, just throw the error
    }
  }

  // Method to get available search providers
  getAvailableProviders(): SearchProvider[] {
    const providers: SearchProvider[] = ['brave', 'searxng'];
    if (this.exaService) {
      providers.push('exa');
    }
    return providers;
  }

  // Method to test if a provider is available
  async testProvider(provider: SearchProvider): Promise<boolean> {
    try {
      const results = [];
      const searchGenerator = this.search('test query', provider, { limit: 1 });
      
      for await (const result of searchGenerator) {
        results.push(result);
        break; // Just need one result to test
      }
      
      return true;
    } catch (error) {
      console.error(`Provider ${provider} test failed:`, error);
      return false;
    }
  }
}