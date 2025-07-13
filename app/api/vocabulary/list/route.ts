import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { container } from '../../../../di/container';
import { SYMBOLS } from '../../../../di/symbols';
import { IVocabularyRepository } from '../../../../src/application/repositories/IVocabularyRepository';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vocabularyRepository = container.get<IVocabularyRepository>(SYMBOLS.VocabularyRepository);
    
    // Get all vocabulary entries for the user
    const entries = await vocabularyRepository.findByUserId(userId);
    
    // Transform entries to include necessary data
    const vocabularyList = entries.map(entry => ({
      id: entry.id,
      word: entry.word,
      content: entry.content,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    // Remove duplicates by word (keep the most recent)
    const uniqueWords = new Map();
    vocabularyList.forEach(entry => {
      const existing = uniqueWords.get(entry.word);
      if (!existing || new Date(entry.updatedAt) > new Date(existing.updatedAt)) {
        uniqueWords.set(entry.word, entry);
      }
    });

    const uniqueVocabularyList = Array.from(uniqueWords.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return Response.json({
      entries: uniqueVocabularyList,
      total: uniqueVocabularyList.length
    });

  } catch (error) {
    console.error('Error fetching vocabulary list:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}