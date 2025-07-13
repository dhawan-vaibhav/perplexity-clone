import { ThreadItem, CreateThreadItem, UpdateThreadItem } from '../../entities/models/thread-item';

export interface IThreadItemRepository {
  create(threadItem: CreateThreadItem): Promise<ThreadItem>;
  findById(id: string): Promise<ThreadItem | null>;
  findByThreadId(threadId: string): Promise<ThreadItem[]>;
  update(id: string, updates: UpdateThreadItem): Promise<ThreadItem>;
}