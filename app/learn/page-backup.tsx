'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { VocabularyContent } from '../../src/entities/models/vocabulary';
import { ArrowLeft, BookOpen, Volume2, Copy, CheckCircle, Sparkles, Clock } from 'lucide-react';
import { LearnIcon } from '../../components/icons/LearnIcon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface VocabularyEntry {
  id: string;
  word: string;
  content: VocabularyContent;
  createdAt: string;
  updatedAt: string;
}

export default function LearnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const word = searchParams.get('word');
  const threadItemId = searchParams.get('threadItemId');
  const context = searchParams.get('context');
  const model = searchParams.get('model');
  
  const [vocabularyContent, setVocabularyContent] = useState<VocabularyContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedExample, setCopiedExample] = useState<number | null>(null);
  const [vocabularyList, setVocabularyList] = useState<VocabularyEntry[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

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

  const handleCopyExample = (example: string, index: number, entryId?: string) => {
    navigator.clipboard.writeText(example);
    setCopiedExample(entryId ? `${entryId}-${index}` : index);
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
      <div className="min-h-screen" style={{ backgroundColor: '#fcfcf9' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <LearnIcon className="w-8 h-8" width={32} height={32} />
                <h1 className="text-3xl font-bold">My Vocabulary</h1>
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <LearnIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" width={64} height={64} />
                <h2 className="text-2xl font-bold mb-2">No vocabulary yet</h2>
                <p className="text-muted-foreground mb-6">Click on vocabulary words in your search results to start building your collection.</p>
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Start Searching
                </Link>
              </div>
            )}

            {/* Vocabulary List with Full Cards */}
            {!isLoadingList && vocabularyList.length > 0 && (
              <div className="space-y-6">
                {vocabularyList.map((entry) => (
                  <div key={entry.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Word Header */}
                    <div className="bg-primary/5 p-6 border-b">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold">{entry.content.word}</h2>
                            <button
                              onClick={() => {
                                if ('speechSynthesis' in window) {
                                  const utterance = new SpeechSynthesisUtterance(entry.content.word);
                                  utterance.rate = 0.8;
                                  speechSynthesis.speak(utterance);
                                }
                              }}
                              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                              title="Pronounce word"
                            >
                              <Volume2 className="w-5 h-5 text-primary" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground">{entry.content.pronunciation}</span>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                              {entry.content.partOfSpeech}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              entry.content.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                              entry.content.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {entry.content.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Sections */}
                    <div className="p-6 space-y-6">
                      {/* Definition */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Definition
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">{entry.content.definition}</p>
                      </div>

                      {/* Examples */}
                      {entry.content.examples && entry.content.examples.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Examples
                          </h3>
                          <div className="space-y-3">
                            {entry.content.examples.map((example, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
                                <span className="text-sm text-muted-foreground mt-0.5">{index + 1}.</span>
                                <p className="flex-1 text-sm leading-relaxed">{example}</p>
                                <button
                                  onClick={() => handleCopyExample(example, index, entry.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                                  title="Copy example"
                                >
                                  {copiedExample === `${entry.id}-${index}` ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-muted-foreground" />
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
                          <h3 className="text-lg font-semibold mb-3">Synonyms</h3>
                          <div className="flex flex-wrap gap-2">
                            {entry.content.synonyms.map((synonym, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors cursor-pointer"
                              >
                                {synonym}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related Context */}
                      {entry.content.relatedContext && (
                        <div className="pt-4 border-t">
                          <h3 className="text-lg font-semibold mb-2">Context</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {entry.content.relatedContext}
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      <div className="pt-4 border-t flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Added {new Date(entry.updatedAt).toLocaleDateString()}</span>
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
              onClick={() => router.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to search</span>
            </button>
            
            <div className="flex items-center gap-3">
              <LearnIcon className="w-8 h-8 text-primary" width={32} height={32} />
              <h1 className="text-3xl font-bold">Vocabulary Learning</h1>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
                  <div className="absolute top-0 w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-muted-foreground">Generating learning content...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          )}

          {/* Vocabulary Card */}
          {vocabularyContent && !isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Word Header */}
              <div className="bg-primary/5 p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold">{vocabularyContent.word}</h2>
                      <button
                        onClick={handlePronounce}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        title="Pronounce word"
                      >
                        <Volume2 className="w-5 h-5 text-primary" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">{vocabularyContent.pronunciation}</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        {vocabularyContent.partOfSpeech}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        vocabularyContent.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                        vocabularyContent.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {vocabularyContent.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="p-6 space-y-6">
                {/* Definition */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Definition
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{vocabularyContent.definition}</p>
                </div>

                {/* Examples */}
                {vocabularyContent.examples && vocabularyContent.examples.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Examples
                    </h3>
                    <div className="space-y-3">
                      {vocabularyContent.examples.map((example, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
                          <span className="text-sm text-muted-foreground mt-0.5">{index + 1}.</span>
                          <p className="flex-1 text-sm leading-relaxed">{example}</p>
                          <button
                            onClick={() => handleCopyExample(example, index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                            title="Copy example"
                          >
                            {copiedExample === index ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
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
                    <h3 className="text-lg font-semibold mb-3">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {vocabularyContent.synonyms.map((synonym, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                          {synonym}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Context */}
                {vocabularyContent.relatedContext && (
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-2">Context</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {vocabularyContent.relatedContext}
                    </p>
                  </div>
                )}

                {/* Search Context (if provided) */}
                {context && (
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-2">Found in search</h3>
                    <p className="text-sm text-muted-foreground italic">"{context}"</p>
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