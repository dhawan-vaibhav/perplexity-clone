import { SearchResult, Citation } from '../../entities/models/thread-item';

export class CitationExtractionService {
  extractCitations(response: string, searchResults: SearchResult[]): Citation[] {
    const citations: Citation[] = [];
    const citationRegex = /\[(\d+)\]/g;
    let match;

    while ((match = citationRegex.exec(response)) !== null) {
      const sourceIndex = parseInt(match[1]);
      const arrayIndex = sourceIndex - 1;
      
      if (arrayIndex >= 0 && arrayIndex < searchResults.length) {
        const searchResult = searchResults[arrayIndex];
        
        citations.push({
          sourceIndex,
          text: match[0],
          url: searchResult.url,
          title: searchResult.title,
          snippet: searchResult.snippet,
        });
      }
    }

    const uniqueCitations = citations.filter((citation, index, self) => 
      index === self.findIndex(c => c.sourceIndex === citation.sourceIndex)
    );

    return uniqueCitations.sort((a, b) => a.sourceIndex - b.sourceIndex);
  }

  validateCitations(response: string, searchResultsCount: number): string[] {
    const errors: string[] = [];
    const citationRegex = /\[(\d+)\]/g;
    let match;

    while ((match = citationRegex.exec(response)) !== null) {
      const sourceIndex = parseInt(match[1]);
      
      if (sourceIndex < 1 || sourceIndex > searchResultsCount) {
        errors.push(`Invalid citation [${sourceIndex}] - only [1] to [${searchResultsCount}] are valid`);
      }
    }

    return errors;
  }
}