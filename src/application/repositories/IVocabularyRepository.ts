import { VocabularyEntry, CreateVocabularyEntry } from '../../entities/models/vocabulary';

export interface IVocabularyRepository {
  findByWordAndThreadItem(word: string, threadItemId: string, userId: string): Promise<VocabularyEntry | null>;
  findByWordAndUser(word: string, userId: string): Promise<VocabularyEntry | null>;
  create(entry: CreateVocabularyEntry): Promise<VocabularyEntry>;
  findById(id: string): Promise<VocabularyEntry | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<VocabularyEntry[]>;
}