import { eq, desc } from 'drizzle-orm';
import { db } from '../../../drizzle/config';
import { threads } from '../../../drizzle/schema';
import { Thread, CreateThread } from '../../entities/models/thread';
import { IThreadRepository } from '../../application/repositories/IThreadRepository';

export class ThreadsRepository implements IThreadRepository {
  async create(thread: CreateThread): Promise<Thread> {
    const [newThread] = await db
      .insert(threads)
      .values({
        userId: thread.userId,
        title: thread.title,
      })
      .returning();

    return {
      id: newThread.id,
      userId: newThread.userId,
      title: newThread.title,
      createdAt: newThread.createdAt,
      updatedAt: newThread.updatedAt,
    };
  }

  async findById(id: string): Promise<Thread | null> {
    const [thread] = await db
      .select()
      .from(threads)
      .where(eq(threads.id, id));

    if (!thread) return null;

    return {
      id: thread.id,
      userId: thread.userId,
      title: thread.title,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    };
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<Thread[]> {
    const results = await db
      .select()
      .from(threads)
      .orderBy(desc(threads.updatedAt))
      .limit(limit)
      .offset(offset);

    return results.map(thread => ({
      id: thread.id,
      userId: thread.userId,
      title: thread.title,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }));
  }

  async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Thread[]> {
    const results = await db
      .select()
      .from(threads)
      .where(eq(threads.userId, userId))
      .orderBy(desc(threads.updatedAt))
      .limit(limit)
      .offset(offset);

    return results.map(thread => ({
      id: thread.id,
      userId: thread.userId,
      title: thread.title,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }));
  }

  async updateLastActivity(id: string): Promise<void> {
    await db
      .update(threads)
      .set({ updatedAt: new Date() })
      .where(eq(threads.id, id));
  }

  async delete(id: string): Promise<void> {
    try {
      // Use a transaction to ensure the delete is committed
      await db.transaction(async (tx) => {
        const result = await tx
          .delete(threads)
          .where(eq(threads.id, id))
          .returning();
        
        if (result.length === 0) {
          throw new Error(`Failed to delete thread ${id} - no rows affected`);
        }
      });
    } catch (error) {
      console.error('Error in delete operation:', error);
      throw error;
    }
  }
}