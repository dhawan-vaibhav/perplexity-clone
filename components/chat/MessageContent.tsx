'use client';

import React from 'react';
import Markdown from 'markdown-to-jsx';
import { SearchResult, VocabularyWord } from '../../src/entities/models/thread-item';
import InlineCitation from './InlineCitation';
import VocabularyLink from '../vocabulary/VocabularyLink';

interface MessageContentProps {
  content: string;
  searchResults?: SearchResult[];
  vocabulary?: VocabularyWord[];
  threadItemId?: string;
  threadId?: string;
  model?: string;
}

export default function MessageContent({ content, searchResults = [], vocabulary = [], threadItemId, threadId, model }: MessageContentProps) {
  const [processedContent, setProcessedContent] = React.useState(content);

  React.useEffect(() => {
    const citationRegex = /\[(\d+)\]/g;
    let processed = content;

    if (searchResults && searchResults.length > 0) {
      processed = content.replace(citationRegex, (match, citationNum) => {
        const num = parseInt(citationNum);
        if (!isNaN(num) && num > 0 && num <= searchResults.length) {
          const source = searchResults[num - 1];
          if (source) {
            return `<citation-link data-num="${num}" data-url="${encodeURIComponent(source.url)}" data-title="${encodeURIComponent(source.title || '')}" data-snippet="${encodeURIComponent(source.snippet || '')}" data-favicon="${encodeURIComponent(source.favicon || '')}">${num}</citation-link>`;
          }
        }
        return match;
      });
    }

    if (threadItemId) {
      const invisibleMarkerRegex = /(\w+)([^a-zA-Z0-9]*)\u200C\u200D/g;
      let found = false;
      let foundWords: string[] = [];
      processed = processed.replace(invisibleMarkerRegex, (match, word, punctuation) => {
        foundWords.push(word);
        found = true;
        return `<vocabword data-word="${word}" data-thread-item-id="${threadItemId}">${word}</vocabword>${punctuation}`;
      });
      
      if (foundWords.length > 0) {
      }
      
      if (!found) {
        if (processed.includes('⟨ZWNJ⟩⟨ZWJ⟩')) {
          
          const bracketPattern = /(\w+)([^a-zA-Z]*)⟨ZWNJ⟩⟨ZWJ⟩/g;
          
          processed = processed.replace(bracketPattern, (match, word, punctuation, offset) => {
            found = true;
            foundWords.push(word);
            return `<vocabword data-word="${word}" data-thread-item-id="${threadItemId}">${word}</vocabword>${punctuation}`;
          });
          
          if (foundWords.length > 0) {
          }
        }
        
        if (!found && processed.includes('\u200C')) {
          const debugIndex = processed.indexOf('\u200C');
          if (debugIndex !== -1) {
            const before = processed.substring(Math.max(0, debugIndex - 20), debugIndex);
            const after = processed.substring(debugIndex + 1, Math.min(processed.length, debugIndex + 5));
          }
        }
      }
    }

    setProcessedContent(processed);
  }, [content, searchResults, vocabulary, threadItemId]);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none text-black dark:text-white">
      <Markdown
        options={{
          overrides: {
            p: {
              props: {
                className: 'mb-4 leading-relaxed'
              }
            },
            h1: {
              props: {
                className: 'text-2xl font-bold mb-4 mt-6'
              }
            },
            h2: {
              props: {
                className: 'text-xl font-bold mb-3 mt-5'
              }
            },
            h3: {
              props: {
                className: 'text-lg font-semibold mb-2 mt-4'
              }
            },
            ul: {
              props: {
                className: 'list-disc pl-6 mb-4 space-y-1'
              }
            },
            ol: {
              props: {
                className: 'list-decimal pl-6 mb-4 space-y-1'
              }
            },
            li: {
              props: {
                className: 'leading-relaxed'
              }
            },
            strong: {
              props: {
                className: 'font-semibold'
              }
            },
            'citation-link': {
              component: ({ 'data-num': citationNum, 'data-url': url, 'data-title': title, 'data-snippet': snippet, 'data-favicon': favicon, children }) => {
                const num = parseInt(citationNum);
                const source = {
                  url: url ? decodeURIComponent(url) : '',
                  title: title ? decodeURIComponent(title) : '',
                  snippet: snippet ? decodeURIComponent(snippet) : '',
                  favicon: favicon ? decodeURIComponent(favicon) : ''
                };
                
                return (
                  <InlineCitation
                    key={`citation-${num}`}
                    citationNumber={num}
                    source={source}
                  />
                );
              }
            },
            vocabword: {
              component: ({ 'data-word': word, 'data-thread-item-id': threadItemId, children }) => {
                return (
                  <VocabularyLink
                    word={word}
                    threadItemId={threadItemId}
                    threadId={threadId}
                    model={model}
                    children={children}
                  />
                );
              }
            }
          }
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  );
}