// src/infrastructure/services/unified-llm.service.ts
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { SearchResult } from '../../entities/models/thread-item';
import { ILLMService } from '../../application/services/ILLMService';
import { PromptTemplateService } from './prompt-template.service';

const models = {
  'gpt-4o-mini': openai('gpt-4o-mini'),
  'gpt-4o': openai('gpt-4o'),
  'gpt-4': openai('gpt-4'),
  'gemini-flash': google('gemini-1.5-flash'),
  'gemini-pro': google('gemini-1.5-pro'),
};

export type ModelKey = keyof typeof models;

export const AVAILABLE_MODELS = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'gemini-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'gemini-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
] as const;

export class UnifiedLLMService implements ILLMService {
  private readonly promptService: PromptTemplateService;

  constructor() {
    this.promptService = new PromptTemplateService();
  }

  async *generateAnswer(
    query: string,
    searchResults: SearchResult[],
    options?: { model?: string; temperature?: number }
  ): AsyncGenerator<string, void, unknown> {
    const modelKey = (options?.model || 'gpt-4o-mini') as ModelKey;
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
        temperature: options?.temperature || 0.7,
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