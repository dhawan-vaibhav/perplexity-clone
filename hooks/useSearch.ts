'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, StreamEvent, UseSearchReturn } from '../types/chat';
import { Thread } from '../src/entities/models/thread';
import { ThreadItem } from '../src/entities/models/thread-item';

export const useSearch = (initialThreadId?: string): UseSearchReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [isLoadingThread, setIsLoadingThread] = useState(!!initialThreadId);

  // Load existing thread data when threadId is provided
  const loadThread = useCallback(async (threadId: string) => {
    setIsLoadingThread(true);
    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        const { thread, threadItems } = data;
        
        setCurrentThread(thread);
        
        // Convert ThreadItems to ChatMessages
        const chatMessages: ChatMessage[] = [];
        
        for (const item of threadItems) {
          // Add user message
          chatMessages.push({
            id: `user-${item.id}`,
            threadId: thread.id,
            content: item.query,
            role: 'user',
            createdAt: new Date(item.createdAt),
          });
          
          // Add assistant message if there's a response
          if (item.llmResponse) {
            chatMessages.push({
              id: `assistant-${item.id}`,
              threadId: thread.id,
              content: item.llmResponse,
              role: 'assistant',
              searchResults: item.searchResults,
              citations: item.citations,
              vocabulary: item.vocabulary,
              threadItemId: item.id, // Add threadItemId for vocabulary navigation
              isComplete: item.isComplete,
              createdAt: new Date(item.createdAt),
            });
          }
        }
        
        setMessages(chatMessages);
      } else {
        console.error('Failed to load thread');
      }
    } catch (error) {
      console.error('Error loading thread:', error);
    } finally {
      setIsLoadingThread(false);
    }
  }, []);

  // Load thread on mount if threadId is provided
  useEffect(() => {
    if (initialThreadId) {
      loadThread(initialThreadId);
    }
  }, [initialThreadId, loadThread]);

  const sendMessage = useCallback(async (
    query: string, 
    threadId?: string,
    options?: { model?: string; searchProvider?: string }
  ) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      threadId: threadId || 'temp',
      content: query,
      role: 'user',
      createdAt: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        credentials: 'include',
        body: JSON.stringify({
          query,
          threadId,
          model: options?.model || 'gemini-flash',
          searchProvider: options?.searchProvider || 'brave',
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        threadId: threadId || 'temp',
        content: '',
        role: 'assistant',
        searchResults: [],
        citations: [],
        isComplete: false,
        createdAt: new Date(),
      };

      let messageAdded = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const event: StreamEvent = JSON.parse(data);
              
              switch (event.type) {
                case 'thread_created':
                  // Update thread info
                  setCurrentThread({
                    id: event.data.threadId,
                    title: event.data.title,
                    createdAt: new Date(event.data.createdAt),
                    updatedAt: new Date(event.data.createdAt),
                  });
                  
                  // Update message threadIds
                  assistantMessage.threadId = event.data.threadId;
                  setMessages(prev => prev.map(msg => 
                    msg.id === userMessage.id 
                      ? { ...msg, threadId: event.data.threadId }
                      : msg
                  ));
                  break;
                  
                case 'search_result':
                  if (!messageAdded) {
                    setMessages(prev => [...prev, assistantMessage]);
                    messageAdded = true;
                  }
                  
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { 
                          ...msg, 
                          searchResults: [...(msg.searchResults || []), event.data] 
                        }
                      : msg
                  ));
                  break;
                  
                case 'llm_chunk':
                  if (!messageAdded) {
                    setMessages(prev => [...prev, assistantMessage]);
                    messageAdded = true;
                  }
                  
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: msg.content + event.data }
                      : msg
                  ));
                  break;
                  
                case 'citations':
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, citations: event.data }
                      : msg
                  ));
                  break;
                  
                case 'vocabulary':
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, vocabulary: event.data }
                      : msg
                  ));
                  break;
                  
                case 'complete':
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { 
                          ...msg, 
                          isComplete: true,
                          threadItemId: event.data.threadItemId // Add threadItemId for vocabulary navigation
                        }
                      : msg
                  ));
                  break;
                  
                case 'error':
                  console.error('Stream error:', event.data);
                  setMessages(prev => [...prev, {
                    id: `error-${Date.now()}`,
                    threadId: assistantMessage.threadId,
                    content: `Error: ${event.data.message}`,
                    role: 'assistant',
                    isComplete: true,
                    createdAt: new Date(),
                  }]);
                  break;
              }
            } catch (error) {
              console.warn('Failed to parse SSE data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        threadId: threadId || 'temp',
        content: 'Sorry, an error occurred while processing your request.',
        role: 'assistant',
        isComplete: true,
        createdAt: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  return {
    messages,
    isLoading,
    isLoadingThread,
    sendMessage,
    currentThread,
  };
};