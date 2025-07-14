console.log('🔍 Search Route - Loading imports...');
import 'reflect-metadata';
console.log('🔍 Search Route - reflect-metadata imported');
import { NextRequest } from 'next/server';
console.log('🔍 Search Route - NextRequest imported');
import { auth } from '@clerk/nextjs/server';
console.log('🔍 Search Route - auth imported');
import { container } from '../../../di/container';
console.log('🔍 Search Route - container imported');
import { SYMBOLS } from '../../../di/symbols';
console.log('🔍 Search Route - SYMBOLS imported');
import { ISearchController } from '../../../src/interface-adapters/controllers/search-controller';
console.log('🔍 Search Route - All imports completed');

async function handleSearch(body: Record<string, unknown>) {
  console.log('🔍 Attempting to get search controller from DI container');
  let searchController;
  try {
    // Get the search controller from DI container
    searchController = container.get<ISearchController>(SYMBOLS.SearchController);
    console.log('✅ Search controller retrieved successfully');
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
          console.log('📤 Sending event:', (event as { type: string }).type);
          
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
      console.log('Stream cancelled by client');
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
    console.log('🔍 Search API - Step 1: Entering POST handler');
    
    // Get the userId from Clerk auth
    console.log('🔍 Search API - Step 2: Getting userId from auth');
    const { userId } = await auth();
    
    console.log('🔍 Search API - userId:', userId);
    
    if (!userId) {
      console.log('❌ Search API - No userId found');
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('🔍 Search API - Step 3: Parsing request body');
    // Parse request body
    const body = await request.json();
    console.log('🔍 Search API - Step 4: Body parsed successfully');
    
    // Add userId to the request body so the search controller can use it
    body.userId = userId;
    
    console.log('🔍 Search API - Step 5: Checking for SSE upgrade');
    // Check if client accepts event-stream (for connection upgrade)
    const accept = request.headers.get('accept');
    const upgradeToSSE = accept?.includes('text/event-stream');
    
    if (upgradeToSSE) {
      console.log('🔍 Search API - Step 6: Upgrading to SSE, calling handleSearch');
      // Upgrade connection to SSE
      return await handleSearch(body);
    } else {
      console.log('🔍 Search API - Step 7: No SSE requested, returning JSON');
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