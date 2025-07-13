import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { container } from '../../../../di/container';
import { SYMBOLS } from '../../../../di/symbols';
import { IThreadRepository } from '../../../../src/application/repositories/IThreadRepository';
import { IThreadItemRepository } from '../../../../src/application/repositories/IThreadItemRepository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  try {
    // Get the userId from Clerk auth
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const threadRepository = container.get<IThreadRepository>(SYMBOLS.ThreadRepository);
    const threadItemRepository = container.get<IThreadItemRepository>(SYMBOLS.ThreadItemRepository);
    
    const thread = await threadRepository.findById(threadId);
    
    if (!thread) {
      return Response.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Check if thread belongs to the authenticated user
    if (thread.userId && thread.userId !== userId) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    const threadItems = await threadItemRepository.findByThreadId(threadId);
    
    return Response.json({
      thread,
      threadItems,
    }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { threadId } = await params;
  
  try {
    // Get the userId from Clerk auth
    const { userId } = await auth();
    
    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const threadRepository = container.get<IThreadRepository>(SYMBOLS.ThreadRepository);
    
    // Check if thread exists
    const thread = await threadRepository.findById(threadId);
    
    if (!thread) {
      return Response.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Check if thread belongs to the authenticated user
    if (thread.userId && thread.userId !== userId) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Delete the thread (this should cascade delete thread items via DB constraints)
    await threadRepository.delete(threadId);
    
    return Response.json(
      { message: 'Thread deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return Response.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}