'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface VocabularyLinkProps {
  word: string;
  threadItemId: string;
  threadId?: string;
  searchQuery?: string;
  context?: string;
  model?: string;
  children?: React.ReactNode;
}

const VocabularyLink: React.FC<VocabularyLinkProps> = React.memo(({
  word,
  threadItemId,
  threadId,
  searchQuery,
  context,
  model,
  children
}) => {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams({
      word,
      threadItemId,
      ...(threadId && { threadId }),
      ...(searchQuery && { searchQuery }),
      ...(context && { context }),
      ...(model && { model })
    });
    
    router.push(`/learn?${params.toString()}`);
  };

  return (
    <span
      onClick={handleClick}
      className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium underline decoration-blue-600/30 hover:decoration-blue-800/50 underline-offset-2"
      title={`Learn about "${word}"`}
    >
      {children || word}
    </span>
  );
});

VocabularyLink.displayName = 'VocabularyLink';

export default VocabularyLink;