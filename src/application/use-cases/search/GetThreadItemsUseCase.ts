import { ThreadItem } from '../../../entities/models/thread-item';
import { IThreadItemRepository } from '../../repositories/IThreadItemRepository';

export class GetThreadItemsUseCase {
  constructor(
    private threadItemRepository: IThreadItemRepository,
  ) {}

  async execute(threadId: string): Promise<ThreadItem[]> {
    return await this.threadItemRepository.findByThreadId(threadId);
  }
}