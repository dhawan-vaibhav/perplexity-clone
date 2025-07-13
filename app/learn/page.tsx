'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VocabularyContent } from '../../src/entities/models/vocabulary';

export default function LearnPage() {
  const searchParams = useSearchParams();
  const word = searchParams.get('word');
  const threadItemId = searchParams.get('threadItemId');
  const context = searchParams.get('context');
  
  const [vocabularyContent, setVocabularyContent] = useState<VocabularyContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!word || !threadItemId) {
      setError('Missing required parameters');
      return;
    }

    const fetchVocabularyContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/vocabulary/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            word,
            threadItemId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vocabulary content');
        }

        const content = await response.json();
        setVocabularyContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVocabularyContent();
  }, [word, threadItemId]);

  if (!word || !threadItemId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Learn</h1>
          <p className="text-red-600">Missing required parameters. Please navigate from a vocabulary word link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Learn: {word}</h1>
        
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading vocabulary content...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {vocabularyContent && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {vocabularyContent.word}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                /{vocabularyContent.pronunciation}/
              </p>
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                {vocabularyContent.partOfSpeech}
              </span>
              <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-sm ml-2">
                {vocabularyContent.difficulty}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Definition</h3>
              <p className="text-gray-700 dark:text-gray-300">{vocabularyContent.definition}</p>
            </div>

            {vocabularyContent.examples && vocabularyContent.examples.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Examples</h3>
                <ul className="space-y-2">
                  {vocabularyContent.examples.map((example, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300 italic">
                      "{example}"
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {vocabularyContent.synonyms && vocabularyContent.synonyms.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Synonyms</h3>
                <div className="flex flex-wrap gap-2">
                  {vocabularyContent.synonyms.map((synonym, index) => (
                    <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-sm">
                      {synonym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {context && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Context</h3>
                <p className="text-gray-600 dark:text-gray-400 italic">{context}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}