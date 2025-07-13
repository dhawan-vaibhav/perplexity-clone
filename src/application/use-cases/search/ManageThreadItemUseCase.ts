// src/application/use-cases/search/ManageThreadItemUseCase.ts (Updated)
import { ThreadItem, CreateThreadItem, UpdateThreadItem, SearchResult, Citation, VocabularyWord } from '../../../entities/models/thread-item';
import { IThreadItemRepository } from '../../repositories/IThreadItemRepository';
import { IThreadRepository } from '../../repositories/IThreadRepository';

export class ManageThreadItemUseCase {
  constructor(
    private threadItemRepository: IThreadItemRepository,
    private threadRepository: IThreadRepository,
  ) {}

  async createItem(threadId: string, query: string): Promise<ThreadItem> {
    const createThreadItem: CreateThreadItem = {
      threadId,
      query,
    };
    
    return await this.threadItemRepository.create(createThreadItem);
  }

  async updateWithSearchResults(id: string, searchResults: SearchResult[]): Promise<ThreadItem> {
    const updateData: UpdateThreadItem = { searchResults };
    return await this.threadItemRepository.update(id, updateData);
  }

  async completeItem(id: string, llmResponse: string): Promise<ThreadItem> {
    const updateData: UpdateThreadItem = {
      llmResponse,
      isComplete: true,
    };
    const updatedItem = await this.threadItemRepository.update(id, updateData);
    
    // Update thread activity
    await this.threadRepository.updateLastActivity(updatedItem.threadId);
    
    return updatedItem;
  }

  // New method to complete with citations
  async completeItemWithCitations(
    id: string, 
    llmResponse: string, 
    citations: Citation[]
  ): Promise<ThreadItem> {
    const updateData: UpdateThreadItem = {
      llmResponse,
      citations,
      isComplete: true,
    };
    const updatedItem = await this.threadItemRepository.update(id, updateData);
    
    // Update thread activity
    await this.threadRepository.updateLastActivity(updatedItem.threadId);
    
    return updatedItem;
  }

  // New method to complete with citations and vocabulary
  async completeItemWithCitationsAndVocabulary(
    id: string, 
    llmResponse: string, 
    citations: Citation[],
    vocabulary: VocabularyWord[]
  ): Promise<ThreadItem> {
    const updateData: UpdateThreadItem = {
      llmResponse,
      citations,
      vocabulary,
      isComplete: true,
    };
    const updatedItem = await this.threadItemRepository.update(id, updateData);
    
    // Update thread activity
    await this.threadRepository.updateLastActivity(updatedItem.threadId);
    
    return updatedItem;
  }
}