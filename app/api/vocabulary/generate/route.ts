import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { container } from '../../../../di/container';
import { SYMBOLS } from '../../../../di/symbols';
import { IVocabularyRepository } from '../../../../src/application/repositories/IVocabularyRepository';
import { ILLMService } from '../../../../src/application/services/ILLMService';
import { VocabularyContent } from '../../../../src/entities/models/vocabulary';

const VOCABULARY_GENERATION_PROMPT = `
You are an expert vocabulary teacher. Generate comprehensive learning content for a word that appeared in a user's search results.

Word: "{word}"
Search Context: "{searchContext}"  
Usage Context: "{usageContext}"

Generate a JSON response with the following structure:
{
  "word": "the word",
  "pronunciation": "phonetic pronunciation using IPA or common format",
  "partOfSpeech": "noun/verb/adjective/adverb/etc",
  "difficulty": "beginner/intermediate/advanced",
  "definition": "clear, concise definition",
  "examples": ["example sentence 1", "example sentence 2"],
  "synonyms": ["synonym1", "synonym2", "synonym3", "synonym4"],
  "relatedContext": "how this word relates to the original search topic"
}

Guidelines:
- Make the definition clear and educational
- Create 2 natural example sentences
- Choose 4-5 relevant synonyms
- Set appropriate difficulty level
- Keep examples concise but contextual
- Make relatedContext connect back to the search topic

Return only the JSON object, no additional text.
`;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { word, threadItemId, searchContext, usageContext } = body;

    if (!word || !threadItemId) {
      return Response.json(
        { error: 'Missing required fields: word, threadItemId' },
        { status: 400 }
      );
    }

    const vocabularyRepository = container.get<IVocabularyRepository>(SYMBOLS.VocabularyRepository);
    
    // 1. Check if vocabulary entry already exists for this word + threadItem
    const existingEntry = await vocabularyRepository.findByWordAndThreadItem(
      word, 
      threadItemId, 
      userId
    );
    
    if (existingEntry) {
      console.log(`✅ Using cached vocabulary for word: ${word}`);
      return Response.json(existingEntry.content);
    }

    // 2. Check if word exists for this user (different threadItem)
    const existingWordEntry = await vocabularyRepository.findByWordAndUser(word, userId);
    
    if (existingWordEntry) {
      console.log(`🔄 Word exists for user, reusing content: ${word}`);
      
      // Create new entry linking to this threadItem but reuse content
      await vocabularyRepository.create({
        word,
        threadItemId,
        userId,
        content: existingWordEntry.content
      });
      
      return Response.json(existingWordEntry.content);
    }

    // 3. Generate new vocabulary content via LLM
    console.log(`🎯 Generating new vocabulary content for: ${word}`);
    
    const llmService = container.get<ILLMService>(SYMBOLS.LLMService);
    
    const prompt = VOCABULARY_GENERATION_PROMPT
      .replace('{word}', word)
      .replace('{searchContext}', searchContext || 'General context')
      .replace('{usageContext}', usageContext || 'No specific usage context');

    const llmResponse = await llmService.generateResponse(prompt, 'gpt-4o-mini');
    
    // Parse LLM response
    let vocabularyContent: VocabularyContent;
    try {
      vocabularyContent = JSON.parse(llmResponse);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      return Response.json(
        { error: 'Failed to generate vocabulary content' },
        { status: 500 }
      );
    }

    // 4. Save to database
    const newEntry = await vocabularyRepository.create({
      word,
      threadItemId,
      userId,
      content: vocabularyContent
    });

    console.log(`💾 Saved new vocabulary entry: ${word}`);
    return Response.json(vocabularyContent);

  } catch (error) {
    console.error('Vocabulary generation error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}