import { Thread } from '../src/entities/models/thread';
import { ThreadItem, SearchResult, Citation, VocabularyWord } from '../src/entities/models/thread-item';

export interface ChatMessage {
  id: string;
  threadId: string;
  content: string;
  role: 'user' | 'assistant';
  searchResults?: SearchResult[];
  citations?: Citation[];
  vocabulary?: VocabularyWord[];
  threadItemId?: string; // Add this for vocabulary link navigation
  isComplete?: boolean;
  createdAt: Date;
}

export interface StreamEvent {
  type: 'thread_created' | 'search_result' | 'llm_chunk' | 'citations' | 'vocabulary' | 'complete' | 'error';
  data: any;
}

export interface UseSearchReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isLoadingThread: boolean;
  sendMessage: (query: string, threadId?: string, options?: { model?: string; searchProvider?: string }) => Promise<void>;
  currentThread: Thread | null;
}