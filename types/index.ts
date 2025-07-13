// types/index.ts

export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export interface Citation {
  sourceId: number;
  text: string;
}

// Represents a single, completed question-and-answer exchange
export interface ThreadItem {
  query: string;
  llmResponse: string;
  searchResults: SearchResult[];
  citations: Citation[];
}

// Represents the real-time state of the search stream
export interface SearchStreamState {
  threadId: string | null;
  threadHistory: ThreadItem[];
  isStreaming: boolean;
  llmResponse: string; // The response for the *current* query
  searchResults: SearchResult[]; // Results for the *current* query
  citations: Citation[]; // Citations for the *current* query
  error: string | null;
}

// The event structure your SSE endpoint sends
export interface SearchEvent {
  type: 'thread_created' | 'search_result' | 'llm_chunk' | 'citations' | 'complete' | 'error';
  data: any;
}