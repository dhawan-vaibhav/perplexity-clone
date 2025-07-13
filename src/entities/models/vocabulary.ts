export interface VocabularyWord {
  word: string;
  position: number;
  context: string;
}

export interface VocabularyContent {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  definition: string;
  examples: string[];
  synonyms: string[];
  relatedContext?: string;
}

export interface VocabularyEntry {
  id: string;
  word: string;
  threadItemId: string;
  userId: string;
  content: VocabularyContent;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVocabularyEntry {
  word: string;
  threadItemId: string;
  userId: string;
  content: VocabularyContent;
}