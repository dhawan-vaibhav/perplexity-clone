'use client';

import React from 'react';
import { VocabularyWord } from '../../src/entities/models/thread-item';
import VocabularyLink from './VocabularyLink';

interface VocabularyTextProps {
  content: string;
  vocabulary?: VocabularyWord[];
  threadItemId?: string;
  renderContent?: (content: string) => React.ReactNode;
}

const VocabularyText: React.FC<VocabularyTextProps> = ({ 
  content, 
  vocabulary = [], 
  threadItemId,
  renderContent
}) => {
  if (!vocabulary || !vocabulary.length || !threadItemId) {
    return renderContent ? <>{renderContent(content)}</> : <span>{content}</span>;
  }

  const sortedVocabulary = [...vocabulary].sort((a, b) => b.position - a.position);
  
  let processedContent = content;
  const replacements: Array<{ start: number; end: number; element: React.ReactNode }> = [];

  sortedVocabulary.forEach((vocabWord, index) => {
    const { word, position, context } = vocabWord;
    
    const wordEnd = position + word.length;
    
    const actualWord = processedContent.slice(position, wordEnd);
    if (actualWord.toLowerCase() !== word.toLowerCase()) {
      console.warn(`Vocabulary word "${word}" not found at position ${position}`);
      return;
    }

    const vocabularyLink = (
      <VocabularyLink
        key={`vocab-${threadItemId}-${word}-${index}`}
        word={word}
        threadItemId={threadItemId}
        searchQuery=""
        context={context || ""}
      />
    );

    replacements.push({
      start: position,
      end: wordEnd,
      element: vocabularyLink
    });
  });

  if (replacements.length === 0) {
    return renderContent ? <>{renderContent(content)}</> : <span>{content}</span>;
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  const sortedReplacements = replacements.sort((a, b) => a.start - b.start);

  const placeholders: { [key: string]: React.ReactNode } = {};
  
  sortedReplacements.forEach((replacement, index) => {
    const placeholder = `__VOCAB_${index}__`;
    placeholders[placeholder] = replacement.element;
    
    const before = processedContent.slice(0, replacement.start);
    const after = processedContent.slice(replacement.end);
    processedContent = before + placeholder + after;
    
    const lengthDiff = placeholder.length - (replacement.end - replacement.start);
    for (let i = index + 1; i < sortedReplacements.length; i++) {
      sortedReplacements[i].start += lengthDiff;
      sortedReplacements[i].end += lengthDiff;
    }
  });

  if (renderContent) {
    const renderedContent = renderContent(processedContent);
    
    return <>{renderedContent}</>;
  }

  const parts = processedContent.split(/(__VOCAB_\d+__)/);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('__VOCAB_') && placeholders[part]) {
          return <React.Fragment key={index}>{placeholders[part]}</React.Fragment>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};

export default VocabularyText;