import nunjucks from 'nunjucks';
import fs from 'fs';
import path from 'path';
import { SearchResult } from '../../entities/models/thread-item';

export interface PromptVariables {
  query: string;
  searchResults: SearchResult[];
  [key: string]: unknown;
}

export class PromptTemplateService {
  private templates: Map<string, nunjucks.Template> = new Map();

  constructor() {
    
    try {
      
      // Pre-load and compile templates
      const templatePath = path.join(process.cwd(), 'src', 'prompts', 'search-basic.njk');
      
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      
      // Compile the template directly - just like in the working example
      
      const compiledTemplate = nunjucks.compile(templateContent);
      this.templates.set('search-basic.njk', compiledTemplate);
      
    } catch (error) {
      console.error('❌ PromptTemplateService: Failed to initialize:', error);
      throw error;
    }
  }

  renderTemplate(templateName: string, variables: PromptVariables): string {
    try {
      const template = this.templates.get(templateName);
      if (!template) {
        throw new Error(`Template ${templateName} not found`);
      }
      
      return template.render(variables);
    } catch (error) {
      throw new Error(`Failed to render template ${templateName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}