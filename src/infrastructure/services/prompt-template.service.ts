import nunjucks from 'nunjucks';
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
    const templatePath = path.join(process.cwd(), 'src', 'prompts');
    this.env = nunjucks.configure(templatePath, {
      autoescape: false,
      trimBlocks: true,
      lstripBlocks: true,
    });
  }

  renderTemplate(templateName: string, variables: PromptVariables): string {
    try {
      return this.env.render(templateName, variables);
    } catch (error) {
      throw new Error(`Failed to render template ${templateName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}