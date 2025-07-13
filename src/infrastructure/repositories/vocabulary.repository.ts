import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../../drizzle/config';
import { vocabularyEntries } from '../../../drizzle/schema';
import { IVocabularyRepository } from '../../application/repositories/IVocabularyRepository';
import { VocabularyEntry, CreateVocabularyEntry } from '../../entities/models/vocabulary';

export class VocabularyRepository implements IVocabularyRepository {
  async findByWordAndThreadItem(word: string, threadItemId: string, userId: string): Promise<VocabularyEntry | null> {
    const result = await db
      .select()
      .from(vocabularyEntries)
      .where(
        and(
          eq(vocabularyEntries.word, word),
          eq(vocabularyEntries.threadItemId, threadItemId),
          eq(vocabularyEntries.userId, userId)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const entry = result[0];
    return {
      id: entry.id,
      word: entry.word,
      threadItemId: entry.threadItemId,
      userId: entry.userId,
      content: entry.content as any,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  async findByWordAndUser(word: string, userId: string): Promise<VocabularyEntry | null> {
    const result = await db
      .select()
      .from(vocabularyEntries)
      .where(
        and(
          eq(vocabularyEntries.word, word),
          eq(vocabularyEntries.userId, userId)
        )
      )
      .orderBy(desc(vocabularyEntries.createdAt))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const entry = result[0];
    return {
      id: entry.id,
      word: entry.word,
      threadItemId: entry.threadItemId,
      userId: entry.userId,
      content: entry.content as any,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  async create(entry: CreateVocabularyEntry): Promise<VocabularyEntry> {
    const result = await db
      .insert(vocabularyEntries)
      .values({
        word: entry.word,
        threadItemId: entry.threadItemId,
        userId: entry.userId,
        content: entry.content,
      })
      .onConflictDoUpdate({
        target: [vocabularyEntries.word, vocabularyEntries.threadItemId],
        set: {
          content: entry.content,
          updatedAt: new Date(),
        },
      })
      .returning();

    const created = result[0];
    return {
      id: created.id,
      word: created.word,
      threadItemId: created.threadItemId,
      userId: created.userId,
      content: created.content as any,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async findById(id: string): Promise<VocabularyEntry | null> {
    const result = await db
      .select()
      .from(vocabularyEntries)
      .where(eq(vocabularyEntries.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const entry = result[0];
    return {
      id: entry.id,
      word: entry.word,
      threadItemId: entry.threadItemId,
      userId: entry.userId,
      content: entry.content as any,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<VocabularyEntry[]> {
    const results = await db
      .select()
      .from(vocabularyEntries)
      .where(eq(vocabularyEntries.userId, userId))
      .orderBy(desc(vocabularyEntries.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map(entry => ({
      id: entry.id,
      word: entry.word,
      threadItemId: entry.threadItemId,
      userId: entry.userId,
      content: entry.content as any,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));
  }
}