// src/infrastructure/services/unified-llm.service.ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { SearchResult } from '../../entities/models/thread-item';
import { ILLMService } from '../../application/services/ILLMService';
import { PromptTemplateService } from './prompt-template.service';

const models = {
  'gemini-flash': google('gemini-1.5-flash'),
};

export type ModelKey = keyof typeof models;

export const AVAILABLE_MODELS = [
  { id: 'gemini-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
] as const;

export class UnifiedLLMService implements ILLMService {
  private readonly promptService: PromptTemplateService;

  constructor() {
    console.log('🔍 UnifiedLLMService: Starting initialization');
    try {
      this.promptService = new PromptTemplateService();
      console.log('✅ UnifiedLLMService: PromptTemplateService created successfully');
    } catch (error) {
      console.error('❌ UnifiedLLMService: Failed to create PromptTemplateService:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown',
        stack: error instanceof Error ? error.stack : 'No stack'
      });
      throw error;
    }
  }

  async *generateAnswer(
    query: string,
    searchResults: SearchResult[],
    options?: { model?: string; temperature?: number }
  ): AsyncGenerator<string, void, unknown> {
    const modelKey = (options?.model || 'gemini-flash') as ModelKey;
    const model = models[modelKey];
    
    if (!model) {
      throw new Error(`Unknown model: ${modelKey}. Available: ${Object.keys(models).join(', ')}`);
    }

    const variables = { query, searchResults };
    const prompt = this.promptService.renderTemplate('search-basic.njk', variables);

    let streamError: Error | null = null;
    
    try {
      const result = await streamText({
        model,
        prompt,
        temperature: options?.temperature || 0.5,
        maxTokens: 1000,
        onError({ error }) {
          const message = error instanceof Error ? error.message : String(error);
          streamError = new Error(message.replace(/^(Error:|LLM API error:)\s*/i, ''));
        },
      });

      for await (const textPart of result.textStream) {
        if (streamError) {
          throw streamError;
        }
        yield textPart;
      }
      
      if (streamError) {
        throw streamError;
      }
      
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  getAvailableModels() {
    return AVAILABLE_MODELS;
  }
}