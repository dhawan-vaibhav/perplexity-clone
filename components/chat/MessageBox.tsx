'use client';

import { useState } from 'react';
import { ChatMessage } from '../../types/chat';
import { ExternalLink } from 'lucide-react';
import MessageContent from './MessageContent';
import Image from 'next/image';

interface MessageBoxProps {
  message: ChatMessage;
  isLast: boolean;
  isLoading: boolean;
}

export default function MessageBox({ message, isLast, isLoading }: MessageBoxProps) {
  const [activeTab, setActiveTab] = useState<'answer' | 'sources'>('answer');

  if (message.role === 'user') {
    return (
      <div className="w-full pt-8 break-words">
        <h2 className="text-black dark:text-white font-medium text-3xl">
          {message.content}
        </h2>
      </div>
    );
  }

  const hasContent = message.content || (isLast && isLoading);
  const hasSources = message.searchResults && message.searchResults.length > 0;

  return (
    <div className="flex flex-col space-y-4">
      {/* Tab Navigation */}
      {(hasContent || hasSources) && (
        <div className="flex items-center space-x-1 border-b border-gray-200 dark:border-gray-700">
          {hasContent && (
            <button
              onClick={() => setActiveTab('answer')}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'answer'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Image
                src="/answer-icon.svg"
                alt="Answer"
                width={16}
                height={16}
              />
              <span className="font-medium">Answer</span>
            </button>
          )}
          
          {hasSources && (
            <button
              onClick={() => setActiveTab('sources')}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'sources'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Image
                src="/sources-icon.svg"
                alt="Sources"
                width={16}
                height={16}
              />
              <span className="font-medium">Sources</span>
            </button>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="min-h-[100px]">
        {activeTab === 'answer' && hasContent && (
          <div className="space-y-2">
            {message.content ? (
              <MessageContent 
                content={message.content} 
                searchResults={message.searchResults}
                vocabulary={message.vocabulary}
                threadItemId={message.threadItemId}
                threadId={message.threadId}
                model={message.model}
              />
            ) : isLast && isLoading ? (
              <div className="text-gray-500 dark:text-gray-400 italic">Generating response...</div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">Waiting for response...</div>
            )}
          </div>
        )}

        {activeTab === 'sources' && hasSources && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {message.searchResults?.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-900"
                >
                  <div className="flex items-start space-x-2">
                    {source.favicon && (
                      <img 
                        src={source.favicon} 
                        alt="" 
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1 text-black dark:text-white">
                        {source.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {source.snippet}
                      </p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}