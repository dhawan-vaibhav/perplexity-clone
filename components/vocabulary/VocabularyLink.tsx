'use client';

import { useRouter } from 'next/navigation';

interface VocabularyLinkProps {
  word: string;
  threadItemId: string;
  searchQuery?: string;
  context?: string;
}

const VocabularyLink: React.FC<VocabularyLinkProps> = ({
  word,
  threadItemId,
  searchQuery,
  context
}) => {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams({
      word,
      threadItemId,
      ...(searchQuery && { searchQuery }),
      ...(context && { context })
    });
    
    router.push(`/learn?${params.toString()}`);
  };

  return (
    <button
      onClick={handleClick}
      className="underline decoration-blue-400 decoration-2 underline-offset-2 hover:decoration-blue-600 transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
      title={`Learn about "${word}"`}
    >
      {word}
    </button>
  );
};

export default VocabularyLink;