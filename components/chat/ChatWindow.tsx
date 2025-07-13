'use client';

import { useEffect, useRef } from 'react';
import { useSearch } from '../../hooks/useSearch';
import MessageBox from './MessageBox';
import MessageInput from './MessageInput';
import Image from 'next/image';
import { useBackground } from '../../contexts/BackgroundContext';

interface ChatWindowProps {
  threadId?: string;
  initialQuery?: string;
}

export default function ChatWindow({ threadId, initialQuery }: ChatWindowProps) {
  const { messages, isLoading, isLoadingThread, sendMessage, currentThread } = useSearch(threadId);
  const { setShowGridBackground } = useBackground();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);
  const hasLoadedInitialDataRef = useRef(false);

  // Control background based on message state
  useEffect(() => {
    setShowGridBackground(messages.length === 0 && !initialQuery && !isLoadingThread);
  }, [messages.length, initialQuery, isLoadingThread, setShowGridBackground]);

  // Auto-scroll to bottom only for new messages, not when loading historical data
  useEffect(() => {
    // Don't scroll if we're still loading thread data
    if (isLoadingThread) {
      return;
    }

    // If this is the first time we're seeing messages and we have a threadId,
    // it means we just loaded historical data - don't scroll
    if (threadId && !hasLoadedInitialDataRef.current && messages.length > 0) {
      hasLoadedInitialDataRef.current = true;
      previousMessageCountRef.current = messages.length;
      return;
    }

    // Only scroll if we have more messages than before (new messages added)
    if (messages.length > previousMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    previousMessageCountRef.current = messages.length;
  }, [messages, isLoadingThread, threadId]);

  // Send initial query if provided (only for new threads, not existing ones)
  useEffect(() => {
    if (initialQuery && messages.length === 0 && !threadId && !isLoadingThread) {
      sendMessage(initialQuery, threadId);
    }
  }, [initialQuery, threadId, sendMessage, messages.length, isLoadingThread]);

  const handleSendMessage = async (query: string, options?: { model?: string; searchProvider?: string }) => {
    await sendMessage(query, currentThread?.id || threadId, options);
  };

  // Show loading spinner when loading thread data
  if (isLoadingThread) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-gray-200 fill-gray-600 dark:text-gray-600 animate-spin dark:fill-gray-300"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100.003 78.2051 78.1951 100.003 50.5908 100C22.9765 99.9972 0.997224 78.018 1 50.4037C1.00281 22.7993 22.8108 0.997224 50.4251 1C78.0395 1.00281 100.018 22.8108 100 50.4251ZM9.08164 50.594C9.06312 73.3997 27.7909 92.1272 50.5966 92.1457C73.4023 92.1642 92.1298 73.4365 92.1483 50.6308C92.1669 27.8251 73.4392 9.0973 50.6335 9.07878C27.8278 9.06026 9.10003 27.787 9.08164 50.594Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4037 97.8624 35.9116 96.9801 33.5533C95.1945 28.8227 92.871 24.3692 90.0681 20.348C85.6237 14.1775 79.4473 9.36872 72.0454 6.45794C64.6435 3.54717 56.3134 2.65431 48.3133 3.89319C45.869 4.27179 44.3768 6.77534 45.014 9.20079C45.6512 11.6262 48.1343 13.0956 50.5786 12.717C56.5073 11.8281 62.5542 12.5399 68.0406 14.7911C73.527 17.0422 78.2187 20.7487 81.5841 25.4923C83.7976 28.5886 85.4467 32.059 86.4416 35.7474C87.1273 38.1189 89.5423 39.6781 91.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    );
  }

  if (messages.length === 0 && !initialQuery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        {/* Huge Perplexity Text */}
        <div className="text-center mb-8">
          <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-light text-white tracking-tight leading-none">
            perplexity
          </h1>
        </div>
        
        {/* Centered Search Input */}
        <div className="w-full flex justify-center">
          <MessageInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            placeholder="What do you want to know?"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Messages */}
      <div className="flex-1 min-h-[calc(100vh-200px)] p-4 space-y-6 pb-48 lg:pb-32">
        {messages.map((message, index) => (
          <MessageBox
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
            isLoading={isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Floating at bottom for follow-ups */}
      <div className="fixed bottom-20 left-0 right-0 z-40 lg:left-64 lg:bottom-0">
        <div className="bg-gradient-to-t from-white/80 via-white/40 to-transparent dark:from-gray-900/80 dark:via-gray-900/40 dark:to-transparent pt-8 pb-4 flex justify-center">
          <MessageInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading}
            placeholder="Ask a follow-up question..."
            variant="floating"
          />
        </div>
      </div>
    </>
  );
}