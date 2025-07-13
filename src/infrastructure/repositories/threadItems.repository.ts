
import { eq } from 'drizzle-orm';
import { db } from '../../../drizzle/config';
import { threadItems } from '../../../drizzle/schema';
import { ThreadItem, CreateThreadItem, UpdateThreadItem, SearchResult, Citation, VocabularyWord } from '../../entities/models/thread-item';
import { IThreadItemRepository } from '../../application/repositories/IThreadItemRepository';

export class ThreadItemsRepository implements IThreadItemRepository {
  async create(threadItem: CreateThreadItem): Promise<ThreadItem> {
    const [newThreadItem] = await db
      .insert(threadItems)
      .values({
        threadId: threadItem.threadId,
        query: threadItem.query,
      })
      .returning();

    return {
      id: newThreadItem.id,
      threadId: newThreadItem.threadId,
      query: newThreadItem.query,
      searchResults: newThreadItem.searchResults as SearchResult[] | undefined,
      llmResponse: newThreadItem.llmResponse || undefined,
      citations: newThreadItem.citations as Citation[] | undefined,
      isComplete: newThreadItem.isComplete || false,
      createdAt: newThreadItem.createdAt,
    };
  }

  async findById(id: string): Promise<ThreadItem | null> {
    const [threadItem] = await db
      .select()
      .from(threadItems)
      .where(eq(threadItems.id, id));

    if (!threadItem) return null;

    return {
      id: threadItem.id,
      threadId: threadItem.threadId,
      query: threadItem.query,
      searchResults: threadItem.searchResults as SearchResult[] | undefined,
      llmResponse: threadItem.llmResponse || undefined,
      citations: threadItem.citations as Citation[] | undefined,
      vocabulary: threadItem.vocabulary as VocabularyWord[] | undefined,
      isComplete: threadItem.isComplete || false,
      createdAt: threadItem.createdAt,
    };
  }

  async findByThreadId(threadId: string): Promise<ThreadItem[]> {
    const items = await db
      .select()
      .from(threadItems)
      .where(eq(threadItems.threadId, threadId));

    return items.map(item => ({
      id: item.id,
      threadId: item.threadId,
      query: item.query,
      searchResults: item.searchResults as SearchResult[] | undefined,
      llmResponse: item.llmResponse || undefined,
      citations: item.citations as Citation[] | undefined,
      vocabulary: item.vocabulary as VocabularyWord[] | undefined,
      isComplete: item.isComplete || false,
      createdAt: item.createdAt,
    }));
  }

  async update(id: string, updates: UpdateThreadItem): Promise<ThreadItem> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.searchResults !== undefined) {
      updateData.searchResults = updates.searchResults;
    }
    if (updates.llmResponse !== undefined) {
      updateData.llmResponse = updates.llmResponse;
    }
    if (updates.citations !== undefined) {
      updateData.citations = updates.citations;
    }
    if (updates.vocabulary !== undefined) {
      updateData.vocabulary = updates.vocabulary;
    }
    if (updates.isComplete !== undefined) {
      updateData.isComplete = updates.isComplete;
    }

    const [updatedItem] = await db
      .update(threadItems)
      .set(updateData)
      .where(eq(threadItems.id, id))
      .returning();

    return {
      id: updatedItem.id,
      threadId: updatedItem.threadId,
      query: updatedItem.query,
      searchResults: updatedItem.searchResults as SearchResult[] | undefined,
      llmResponse: updatedItem.llmResponse || undefined,
      citations: updatedItem.citations as Citation[] | undefined,
      isComplete: updatedItem.isComplete || false,
      createdAt: updatedItem.createdAt,
    };
  }

  async *streamUpdate(id: string, responseGenerator: AsyncGenerator<string>): AsyncGenerator<string, ThreadItem, unknown> {
    let fullResponse = '';
    
    for await (const chunk of responseGenerator) {
      fullResponse += chunk;
      
      await db
        .update(threadItems)
        .set({ llmResponse: fullResponse })
        .where(eq(threadItems.id, id));
      
      yield chunk;
    }

    const [finalItem] = await db
      .update(threadItems)
      .set({ isComplete: true })
      .where(eq(threadItems.id, id))
      .returning();

    return {
      id: finalItem.id,
      threadId: finalItem.threadId,
      query: finalItem.query,
      searchResults: finalItem.searchResults as SearchResult[] | undefined,
      llmResponse: finalItem.llmResponse || undefined,
      citations: finalItem.citations as Citation[] | undefined,
      isComplete: finalItem.isComplete || false,
      createdAt: finalItem.createdAt,
    };
  }
}