import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { container } from '../../../di/container';
import { SYMBOLS } from '../../../di/symbols';
import { IThreadRepository } from '../../../src/application/repositories/IThreadRepository';

export async function GET(request: NextRequest) {
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
    
    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get only threads for the authenticated user
    const threads = await threadRepository.findByUserId(userId, limit, offset);
    
    return Response.json({
      threads,
      total: threads.length,
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