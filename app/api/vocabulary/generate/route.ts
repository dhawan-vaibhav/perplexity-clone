import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { container } from '../../../../di/container';
import { SYMBOLS } from '../../../../di/symbols';
import { IVocabularyRepository } from '../../../../src/application/repositories/IVocabularyRepository';
import { VocabularyContent } from '../../../../src/entities/models/vocabulary';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

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
    const { word, threadItemId, searchContext, usageContext, model = 'gemini-flash' } = body;

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
      // This will now use UPSERT, so no duplicate key error
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
    
    const prompt = VOCABULARY_GENERATION_PROMPT
      .replace('{word}', word)
      .replace('{searchContext}', searchContext || 'General context')
      .replace('{usageContext}', usageContext || 'No specific usage context');

    try {
      // Map model selection to appropriate provider
      const modelMap = {
        'gemini-flash': google('gemini-1.5-flash'),
      };
      
      const selectedModel = modelMap[model as keyof typeof modelMap] || google('gemini-1.5-flash');
      
      const { text } = await generateText({
        model: selectedModel,
        prompt: prompt,
        temperature: 0.7,
        maxTokens: 500,
      });

      // Parse LLM response
      let vocabularyContent: VocabularyContent;
      try {
        // Remove markdown code blocks if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.slice(7); // Remove ```json
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.slice(3); // Remove ```
        }
        if (cleanedText.endsWith('```')) {
          cleanedText = cleanedText.slice(0, -3); // Remove closing ```
        }
        cleanedText = cleanedText.trim();
        
        vocabularyContent = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse LLM response:', parseError);
        console.error('Raw response:', text);
        return Response.json(
          { error: 'Failed to parse vocabulary content' },
          { status: 500 }
        );
      }

      // 4. Save to database (UPSERT - will update if exists)
      const newEntry = await vocabularyRepository.create({
        word,
        threadItemId,
        userId,
        content: vocabularyContent
      });

      console.log(`💾 Saved vocabulary entry: ${word}`);
      return Response.json(vocabularyContent);
      
    } catch (llmError) {
      console.error('LLM generation error:', llmError);
      return Response.json(
        { error: 'Failed to generate vocabulary content' },
        { status: 500 }
      );
    }

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