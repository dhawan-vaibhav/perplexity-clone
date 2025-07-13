'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { VocabularyContent } from '../../src/entities/models/vocabulary';
import { ArrowLeft, BookOpen, Volume2, Copy, CheckCircle, Sparkles, Clock } from 'lucide-react';
import { LearnIcon } from '../../components/icons/LearnIcon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBackground } from '../../contexts/BackgroundContext';

interface VocabularyEntry {
  id: string;
  word: string;
  content: VocabularyContent;
  createdAt: string;
  updatedAt: string;
}

function LearnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setShowGridBackground } = useBackground();
  const word = searchParams.get('word');
  const threadItemId = searchParams.get('threadItemId');
  const threadId = searchParams.get('threadId');
  const context = searchParams.get('context');
  const model = searchParams.get('model');
  
  const [vocabularyContent, setVocabularyContent] = useState<VocabularyContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedExample, setCopiedExample] = useState<string | number | null>(null);
  const [vocabularyList, setVocabularyList] = useState<VocabularyEntry[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // Turn off grid background for learn page
  useEffect(() => {
    setShowGridBackground(false);
  }, [setShowGridBackground]);

  // Fetch vocabulary list on mount
  useEffect(() => {
    const fetchVocabularyList = async () => {
      try {
        const response = await fetch('/api/vocabulary/list');
        if (!response.ok) {
          throw new Error('Failed to fetch vocabulary list');
        }
        const data = await response.json();
        setVocabularyList(data.entries);
      } catch (err) {
        console.error('Error fetching vocabulary list:', err);
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchVocabularyList();
  }, []);

  useEffect(() => {
    if (!word || !threadItemId) {
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
            model: model || 'gemini-flash',
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
  }, [word, threadItemId, model]);

  const handleCopyExample = (example: string, index: number) => {
    navigator.clipboard.writeText(example);
    setCopiedExample(index);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  const handlePronounce = () => {
    if ('speechSynthesis' in window && vocabularyContent) {
      const utterance = new SpeechSynthesisUtterance(vocabularyContent.word);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Show vocabulary list when no word is selected from URL
  if (!word || !threadItemId) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <LearnIcon className="w-8 h-8" width={32} height={32} />
                <h1 className="text-3xl font-bold">Learn</h1>
              </div>
            </div>

            {/* Loading State */}
            {isLoadingList && (
              <div className="flex justify-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
                  <div className="absolute top-0 w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingList && vocabularyList.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <LearnIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" width={64} height={64} />
                <h2 className="text-2xl font-bold mb-2">No vocabulary yet</h2>
                <p className="text-gray-600 mb-6">Click on vocabulary words in your search results to start building your collection.</p>
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d9488] text-white rounded-lg hover:bg-[#0d9488]/90 transition-colors">
                  Start Searching
                </Link>
              </div>
            )}

            {/* Vocabulary List - Using same card component as individual view */}
            {!isLoadingList && vocabularyList.length > 0 && (
              <div className="space-y-6">
                {vocabularyList.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Compact Word Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold">{entry.content.word}</h2>
                          <button
                            onClick={() => {
                              if ('speechSynthesis' in window) {
                                const utterance = new SpeechSynthesisUtterance(entry.content.word);
                                utterance.rate = 0.8;
                                speechSynthesis.speak(utterance);
                              }
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Pronounce word"
                          >
                            <Volume2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="text-sm text-gray-600">{entry.content.pronunciation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            {entry.content.partOfSpeech}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            entry.content.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                            entry.content.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {entry.content.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Compact Content */}
                    <div className="p-4 space-y-3">
                      {/* Definition */}
                      <div>
                        <h3 className="text-xs font-semibold text-gray-700 mb-1">Definition</h3>
                        <p className="text-sm text-gray-600">{entry.content.definition}</p>
                      </div>

                      {/* Examples */}
                      {entry.content.examples && entry.content.examples.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-700 mb-1">Examples</h3>
                          <div className="space-y-1">
                            {entry.content.examples.map((example, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded group">
                                <span className="text-xs text-gray-500">{index + 1}.</span>
                                <p className="flex-1 text-sm text-gray-600">{example}</p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(example);
                                    setCopiedExample(`${entry.id}-${index}`);
                                    setTimeout(() => setCopiedExample(null), 2000);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 rounded"
                                  title="Copy example"
                                >
                                  {copiedExample === `${entry.id}-${index}` ? (
                                    <CheckCircle className="w-3 h-3 text-green-600" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-gray-400" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Synonyms */}
                      {entry.content.synonyms && entry.content.synonyms.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-700 mb-1">Synonyms</h3>
                          <div className="flex flex-wrap gap-1">
                            {entry.content.synonyms.map((synonym, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                              >
                                {synonym}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Context */}
                      {entry.content.relatedContext && (
                        <div className="pt-2 border-t border-gray-100">
                          <h3 className="text-xs font-semibold text-gray-700 mb-1">Context</h3>
                          <p className="text-xs text-gray-600">
                            {entry.content.relatedContext}
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Added {new Date(entry.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show individual word view when word is selected
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fcfcf9' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => {
                if (threadId) {
                  router.push(`/search/${threadId}`);
                } else {
                  router.back();
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to search</span>
            </button>
            
            <div className="flex items-center gap-3">
              <LearnIcon className="w-8 h-8" width={32} height={32} />
              <h1 className="text-3xl font-bold">Learn</h1>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-xl border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute top-0 w-16 h-16 border-4 border-[#0d9488] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600">Generating learning content...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Vocabulary Card - Individual View */}
          {vocabularyContent && !isLoading && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Compact Word Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{vocabularyContent.word}</h2>
                    <button
                      onClick={handlePronounce}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Pronounce word"
                    >
                      <Volume2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-sm text-gray-600">{vocabularyContent.pronunciation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {vocabularyContent.partOfSpeech}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      vocabularyContent.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      vocabularyContent.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {vocabularyContent.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Compact Content */}
              <div className="p-4 space-y-3">
                {/* Definition */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 mb-1">Definition</h3>
                  <p className="text-sm text-gray-600">{vocabularyContent.definition}</p>
                </div>

                {/* Examples */}
                {vocabularyContent.examples && vocabularyContent.examples.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-1">Examples</h3>
                    <div className="space-y-1">
                      {vocabularyContent.examples.map((example, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded group">
                          <span className="text-xs text-gray-500">{index + 1}.</span>
                          <p className="flex-1 text-sm text-gray-600">{example}</p>
                          <button
                            onClick={() => handleCopyExample(example, index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-gray-100 rounded"
                            title="Copy example"
                          >
                            {copiedExample === index ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synonyms */}
                {vocabularyContent.synonyms && vocabularyContent.synonyms.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-1">Synonyms</h3>
                    <div className="flex flex-wrap gap-1">
                      {vocabularyContent.synonyms.map((synonym, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                          {synonym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Context */}
                {vocabularyContent.relatedContext && (
                  <div className="pt-2 border-t border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-700 mb-1">Context</h3>
                    <p className="text-xs text-gray-600">
                      {vocabularyContent.relatedContext}
                    </p>
                  </div>
                )}

                {/* Search Context */}
                {context && (
                  <div className="pt-2 border-t border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-700 mb-1">Found in search</h3>
                    <p className="text-xs text-gray-600 italic">"{context}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>}>
      <LearnContent />
    </Suspense>
  );
}