import 'reflect-metadata';
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { container } from '../../../di/container';
import { SYMBOLS } from '../../../di/symbols';
import { ISearchController } from '../../../src/interface-adapters/controllers/search-controller';

async function handleSearch(body: Record<string, unknown>) {
  let searchController;
  try {
    // Get the search controller from DI container
    searchController = container.get<ISearchController>(SYMBOLS.SearchController);
  } catch (error) {
    console.error('❌ Failed to get search controller:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
  
  // Create streaming response
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Use the search controller (clean architecture in action!)
        for await (const event of searchController(body)) {
          // Log each event for debugging
          
          // Convert event to SSE format
          const sseData = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(sseData));
        }
        
        // End the stream
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('❌ Search controller error:', error);
        const errorEvent = {
          type: 'error',
          data: {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            stack: error instanceof Error ? error.stack : undefined
          }
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        controller.close();
      }
    },
    
    cancel() {
    }
  });

  // Return streaming response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    
    // Get the userId from Clerk auth
    const { userId } = await auth();
    

    try {
      if (!userId) {
        return Response.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('❌ Search API - Error in userId check:', error);
      return Response.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    
    // Parse request body
    const body = await request.json();
    
    // Add userId to the request body so the search controller can use it
    body.userId = userId;
    
    // Check if client accepts event-stream (for connection upgrade)
    const accept = request.headers.get('accept');
    const upgradeToSSE = accept?.includes('text/event-stream');
    
    if (upgradeToSSE) {
      // Upgrade connection to SSE
      return await handleSearch(body);
    } else {
      // Regular JSON response (for non-streaming clients)
      return Response.json(
        { message: 'Streaming not requested. Use Accept: text/event-stream header for SSE.' },
        { status: 200 }
      );
    }
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