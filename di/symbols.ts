// di/symbols.ts (Updated with Citation Service)
export const SYMBOLS = {
  // Repositories
  ThreadRepository: Symbol.for('ThreadRepository'),
  ThreadItemRepository: Symbol.for('ThreadItemRepository'),
  VocabularyRepository: Symbol.for('VocabularyRepository'),
  
  // Services
  SearchEngineService: Symbol.for('SearchEngineService'),
  LLMService: Symbol.for('LLMService'),
  CitationExtractionService: Symbol.for('CitationExtractionService'),
  
  // Use Cases
  CreateThreadUseCase: Symbol.for('CreateThreadUseCase'),
  PerformSearchUseCase: Symbol.for('PerformSearchUseCase'),
  GenerateAnswerUseCase: Symbol.for('GenerateAnswerUseCase'),
  ManageThreadItemUseCase: Symbol.for('ManageThreadItemUseCase'),
  GetThreadItemsUseCase: Symbol.for('GetThreadItemsUseCase'),
  
  // Controllers
  SearchController: Symbol.for('SearchController'),
  ThreadItemsController: Symbol.for('ThreadItemsController'),
} as const;