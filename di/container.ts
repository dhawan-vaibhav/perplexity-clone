// di/container.ts (Updated with Citation Service)
console.log('🔍 Container - Starting initialization');
import 'reflect-metadata';
console.log('🔍 Container - reflect-metadata imported');
import { Container } from 'inversify';
console.log('🔍 Container - inversify imported');
import { SYMBOLS } from './symbols';
console.log('🔍 Container - SYMBOLS imported');

// Interfaces
import { IThreadRepository } from '../src/application/repositories/IThreadRepository';
import { IThreadItemRepository } from '../src/application/repositories/IThreadItemRepository';
import { IVocabularyRepository } from '../src/application/repositories/IVocabularyRepository';
import { ISearchEngineService } from '../src/application/services/ISearchEngineService';
import { ILLMService } from '../src/application/services/ILLMService';

// Implementations
import { ThreadsRepository } from '../src/infrastructure/repositories/threads.repository';
import { ThreadItemsRepository } from '../src/infrastructure/repositories/threadItems.repository';
import { VocabularyRepository } from '../src/infrastructure/repositories/vocabulary.repository';
import { BraveSearchService } from '../src/infrastructure/services/brave-search.service';
import { CompositeSearchService } from '../src/infrastructure/services/composite-search.service';
import { UnifiedLLMService } from '../src/infrastructure/services/unified-llm.service';
import { CitationExtractionService } from '../src/infrastructure/services/citation-service';

// Use Cases
import { CreateThreadUseCase } from '../src/application/use-cases/search/CreateThreadUseCase';
import { PerformSearchUseCase } from '../src/application/use-cases/search/PerformSearchUseCase';
import { GenerateAnswerUseCase } from '../src/application/use-cases/search/GenerateAnswerUseCase';
import { ManageThreadItemUseCase } from '../src/application/use-cases/search/ManageThreadItemUseCase';
import { GetThreadItemsUseCase } from '../src/application/use-cases/search/GetThreadItemsUseCase';

// Controllers
import { createSearchController, ISearchController } from '../src/interface-adapters/controllers/search-controller';
import { createThreadItemsController, IThreadItemsController } from '../src/interface-adapters/controllers/thread-items-controller';

console.log('🔍 Container - Creating new Container instance');
const container = new Container();
console.log('🔍 Container - Container instance created');

// Bind Repositories
console.log('🔍 Container - Binding repositories...');
container.bind<IThreadRepository>(SYMBOLS.ThreadRepository).to(ThreadsRepository);
container.bind<IThreadItemRepository>(SYMBOLS.ThreadItemRepository).to(ThreadItemsRepository);
container.bind<IVocabularyRepository>(SYMBOLS.VocabularyRepository).to(VocabularyRepository);

// Bind Services
container.bind<ISearchEngineService>(SYMBOLS.SearchEngineService).toDynamicValue(() => {
  return new CompositeSearchService();
});

container.bind<ILLMService>(SYMBOLS.LLMService).to(UnifiedLLMService);
container.bind<CitationExtractionService>(SYMBOLS.CitationExtractionService).to(CitationExtractionService);

// Bind Use Cases
container.bind<CreateThreadUseCase>(SYMBOLS.CreateThreadUseCase).toDynamicValue(() => {
  return new CreateThreadUseCase(
    container.get<IThreadRepository>(SYMBOLS.ThreadRepository)
  );
});

container.bind<PerformSearchUseCase>(SYMBOLS.PerformSearchUseCase).toDynamicValue(() => {
  return new PerformSearchUseCase(
    container.get<ISearchEngineService>(SYMBOLS.SearchEngineService)
  );
});

container.bind<GenerateAnswerUseCase>(SYMBOLS.GenerateAnswerUseCase).toDynamicValue(() => {
  return new GenerateAnswerUseCase(
    container.get<ILLMService>(SYMBOLS.LLMService)
  );
});

container.bind<ManageThreadItemUseCase>(SYMBOLS.ManageThreadItemUseCase).toDynamicValue(() => {
  return new ManageThreadItemUseCase(
    container.get<IThreadItemRepository>(SYMBOLS.ThreadItemRepository),
    container.get<IThreadRepository>(SYMBOLS.ThreadRepository)
  );
});

container.bind<GetThreadItemsUseCase>(SYMBOLS.GetThreadItemsUseCase).toDynamicValue(() => {
  return new GetThreadItemsUseCase(
    container.get<IThreadItemRepository>(SYMBOLS.ThreadItemRepository)
  );
});

// Bind Controllers
container.bind<ISearchController>(SYMBOLS.SearchController).toDynamicValue(() => {
  return createSearchController(
    container.get<CreateThreadUseCase>(SYMBOLS.CreateThreadUseCase),
    container.get<PerformSearchUseCase>(SYMBOLS.PerformSearchUseCase),
    container.get<GenerateAnswerUseCase>(SYMBOLS.GenerateAnswerUseCase),
    container.get<ManageThreadItemUseCase>(SYMBOLS.ManageThreadItemUseCase),
    container.get<CitationExtractionService>(SYMBOLS.CitationExtractionService)
  );
});

container.bind<IThreadItemsController>(SYMBOLS.ThreadItemsController).toDynamicValue(() => {
  return createThreadItemsController(
    container.get<GetThreadItemsUseCase>(SYMBOLS.GetThreadItemsUseCase)
  );
});

export { container };