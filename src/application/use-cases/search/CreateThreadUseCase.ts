import { CreateThread, Thread } from '../../../entities/models/thread';
import { IThreadRepository } from '../../repositories/IThreadRepository';

export class CreateThreadUseCase {
  constructor(private threadRepository: IThreadRepository) {}

  async execute(title: string, userId: string): Promise<Thread> {
    const createThread: CreateThread = {
      userId,
      title: title.length > 50 ? title.substring(0, 50) + '...' : title,
    };
    
    return await this.threadRepository.create(createThread);
  }
}