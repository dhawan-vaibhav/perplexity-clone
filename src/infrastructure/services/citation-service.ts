import { SearchResult, Citation } from '../../entities/models/thread-item';

export class CitationExtractionService {
  /**
   * Extracts citations from LLM response text
   * Matches [1], [2], [3] etc. and maps them to search results
   */
  extractCitations(response: string, searchResults: SearchResult[]): Citation[] {
    const citations: Citation[] = [];
    const citationRegex = /\[(\d+)\]/g; // Matches [1], [2], [3] etc.
    let match;

    while ((match = citationRegex.exec(response)) !== null) {
      const sourceIndex = parseInt(match[1]);
      const arrayIndex = sourceIndex - 1; // Convert to 0-based for array access
      
      // Validate citation index is within bounds
      if (arrayIndex >= 0 && arrayIndex < searchResults.length) {
        const searchResult = searchResults[arrayIndex];
        
        citations.push({
          sourceIndex, // Keep 1-based for display
          text: match[0], // "[1]", "[2]", etc.
          url: searchResult.url,
          title: searchResult.title,
          snippet: searchResult.snippet,
        });
      }
    }

    // Remove duplicates by sourceIndex
    const uniqueCitations = citations.filter((citation, index, self) => 
      index === self.findIndex(c => c.sourceIndex === citation.sourceIndex)
    );

    return uniqueCitations.sort((a, b) => a.sourceIndex - b.sourceIndex);
  }

  /**
   * Validates that all citations in response exist in search results
   */
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