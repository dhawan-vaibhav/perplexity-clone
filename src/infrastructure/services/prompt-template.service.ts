import * as nunjucks from 'nunjucks';
import path from 'path';
import { SearchResult } from '../../entities/models/thread-item';

export interface PromptVariables {
  query: string;
  searchResults: SearchResult[];
  [key: string]: unknown;
}

export class PromptTemplateService {
  private env: nunjucks.Environment;

  constructor() {
    console.log('🔍 PromptTemplateService: Starting initialization');
    console.log('Current working directory:', process.cwd());
    
    const templatePath = path.join(process.cwd(), 'src', 'prompts');
    console.log('Template path:', templatePath);
    
    try {
      console.log('Creating nunjucks Environment...');
      console.log('nunjucks object:', typeof nunjucks);
      console.log('nunjucks.Environment:', typeof nunjucks.Environment);
      console.log('nunjucks.FileSystemLoader:', typeof nunjucks.FileSystemLoader);
      
      // Create environment instance directly
      this.env = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(templatePath),
        {
          autoescape: false,
          trimBlocks: true,
          lstripBlocks: true,
        }
      );
      console.log('✅ PromptTemplateService: Environment created successfully');
    } catch (error) {
      console.error('❌ PromptTemplateService: Failed to create environment:', error);
      throw error;
    }
  }

  renderTemplate(templateName: string, variables: PromptVariables): string {
    try {
      return this.env.render(templateName, variables);
    } catch (error) {
      throw new Error(`Failed to render template ${templateName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}