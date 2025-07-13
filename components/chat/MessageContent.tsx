'use client';

import React from 'react';
import Markdown from 'markdown-to-jsx';
import { SearchResult, VocabularyWord } from '../../src/entities/models/thread-item';
import InlineCitation from './InlineCitation';
import VocabularyLink from '../vocabulary/VocabularyLink';

interface MessageContentProps {
  content: string;
  searchResults?: SearchResult[];
}

export default function MessageContent({ content, searchResults = [] }: MessageContentProps) {
  const [processedContent, setProcessedContent] = React.useState(content);

  React.useEffect(() => {
    const citationRegex = /\[(\d+)\]/g;
    let processed = content;

    if (searchResults && searchResults.length > 0) {
      // Process citations with unique markers for custom component replacement
      processed = content.replace(citationRegex, (match, citationNum) => {
        const num = parseInt(citationNum);
        if (!isNaN(num) && num > 0 && num <= searchResults.length) {
          const source = searchResults[num - 1];
          if (source) {
            // Use a custom element that we'll replace with our tooltip component
            return `<citation-link data-num="${num}" data-url="${source.url}" data-title="${source.title?.replace(/"/g, '&quot;') || ''}" data-snippet="${source.snippet?.replace(/"/g, '&quot;') || ''}" data-favicon="${source.favicon || ''}">${num}</citation-link>`;
          }
        }
        return match;
      });
    }

    setProcessedContent(processed);
  }, [content, searchResults]);

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
            }
          }
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  );
}