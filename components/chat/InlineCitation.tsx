'use client';

import { SearchResult } from '../../src/entities/models/thread-item';
import CitationTooltip from './CitationTooltip';

interface InlineCitationProps {
  citationNumber: number;
  source: SearchResult;
}

export default function InlineCitation({ citationNumber, source }: InlineCitationProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(source.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <CitationTooltip citationNumber={citationNumber} source={source}>
      <button
        onClick={handleClick}
        className="inline-flex items-center justify-center bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-xs font-medium px-1.5 py-0.5 rounded ml-0.5 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
        title={`Citation ${citationNumber}: ${source.title}`}
      >
        {citationNumber}
      </button>
    </CitationTooltip>
  );
}