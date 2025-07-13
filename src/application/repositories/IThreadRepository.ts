import { Thread, CreateThread } from '../../entities/models/thread';

export interface IThreadRepository {
  create(thread: CreateThread): Promise<Thread>;
  findById(id: string): Promise<Thread | null>;
  findAll(limit?: number, offset?: number): Promise<Thread[]>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Thread[]>;
  updateLastActivity(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}