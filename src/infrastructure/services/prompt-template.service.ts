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
    console.log('🔍 PromptTemplateService: Starting initialization');
    
    try {
      console.log('Loading template files...');
      
      // Pre-load and compile templates
      const templatePath = path.join(process.cwd(), 'src', 'prompts', 'search-basic.njk');
      console.log('Template path:', templatePath);
      
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      console.log('Template loaded, length:', templateContent.length);
      
      // Configure nunjucks without FileSystemLoader
      nunjucks.configure({ 
        autoescape: false,
        trimBlocks: true,
        lstripBlocks: true,
      });
      
      // Compile the template
      const compiledTemplate = nunjucks.compile(templateContent);
      this.templates.set('search-basic.njk', compiledTemplate);
      
      console.log('✅ PromptTemplateService: Template compiled successfully');
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