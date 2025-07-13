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

    // Process citations first
    if (searchResults && searchResults.length > 0) {
      processed = content.replace(citationRegex, (match, citationNum) => {
        const num = parseInt(citationNum);
        if (!isNaN(num) && num > 0 && num <= searchResults.length) {
          const source = searchResults[num - 1];
          if (source) {
            return `<citation-link data-num="${num}" data-url="${source.url}" data-title="${source.title?.replace(/"/g, '&quot;') || ''}" data-snippet="${source.snippet?.replace(/"/g, '&quot;') || ''}" data-favicon="${source.favicon || ''}">${num}</citation-link>`;
          }
        }
        return match;
      });
    }

    // Process vocabulary markers (invisible Unicode markers)
    if (threadItemId) {
      // Look for words followed by zero-width non-joiner (U+200C) + zero-width joiner (U+200D)
      // The LLM might put quotes or other punctuation between the word and markers
      // Updated to handle any punctuation, not just quotes
      const invisibleMarkerRegex = /(\w+)([^a-zA-Z0-9]*)\u200C\u200D/g;
      let found = false;
      let foundWords = [];
      processed = processed.replace(invisibleMarkerRegex, (match, word, punctuation) => {
        foundWords.push(word);
        found = true;
        // Keep any punctuation that was between the word and markers
        return `<vocabword data-word="${word}" data-thread-item-id="${threadItemId}">${word}</vocabword>${punctuation}`;
      });
      
      if (foundWords.length > 0) {
        console.log(`🎯 Found ${foundWords.length} vocabulary words:`, foundWords);
      }
      
      if (!found) {
        // Try alternate patterns the LLM might use
        // Pattern 1: Word followed by literal Unicode names in brackets
        // First, let's check if the pattern exists
        if (processed.includes('⟨ZWNJ⟩⟨ZWJ⟩')) {
          console.log('🔍 Found bracket notation in content');
          
          // Find the word immediately before the markers
          // This pattern looks for any word characters followed by any non-letter characters, then the markers
          const bracketPattern = /(\w+)([^a-zA-Z]*)⟨ZWNJ⟩⟨ZWJ⟩/g;
          
          processed = processed.replace(bracketPattern, (match, word, punctuation, offset) => {
            console.log('🔍 Found vocabulary word with bracket notation:', word);
            console.log('   Full match:', match);
            console.log('   Punctuation:', punctuation);
            found = true;
            foundWords.push(word);
            return `<vocabword data-word="${word}" data-thread-item-id="${threadItemId}">${word}</vocabword>${punctuation}`;
          });
          
          if (foundWords.length > 0) {
            console.log(`🎯 Marked vocabulary word with bracket notation: ${foundWords.join(', ')}`);
          }
        }
        
        if (!found && processed.includes('\u200C')) {
          console.log('🔍 Content contains ZWNJ but not in expected pattern');
          // Debug: find what's actually after the ZWNJ
          const debugIndex = processed.indexOf('\u200C');
          if (debugIndex !== -1) {
            const before = processed.substring(Math.max(0, debugIndex - 20), debugIndex);
            const after = processed.substring(debugIndex + 1, Math.min(processed.length, debugIndex + 5));
            console.log('Context around ZWNJ:', 
              'Before:', JSON.stringify(before),
              'After:', JSON.stringify(after),
              'Char after ZWNJ:', processed.charCodeAt(debugIndex + 1).toString(16)
            );
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
                  url: url,
                  title: (typeof title === 'string' ? title.replace(/&quot;/g, '"') : '') || '',
                  snippet: (typeof snippet === 'string' ? snippet.replace(/&quot;/g, '"') : '') || '',
                  favicon: favicon || ''
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