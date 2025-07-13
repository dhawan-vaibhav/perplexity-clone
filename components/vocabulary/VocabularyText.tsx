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
    // No vocabulary words or threadItemId, render content as-is
    return renderContent ? <>{renderContent(content)}</> : <span>{content}</span>;
  }

  // Sort vocabulary by position (descending) to replace from end to start
  // This prevents position shifts when replacing text
  const sortedVocabulary = [...vocabulary].sort((a, b) => b.position - a.position);
  
  let processedContent = content;
  const replacements: Array<{ start: number; end: number; element: React.ReactNode }> = [];

  sortedVocabulary.forEach((vocabWord, index) => {
    const { word, position, context } = vocabWord;
    
    // Find the word at the specified position
    const wordEnd = position + word.length;
    
    // Verify the word actually exists at this position
    const actualWord = processedContent.slice(position, wordEnd);
    if (actualWord.toLowerCase() !== word.toLowerCase()) {
      console.warn(`Vocabulary word "${word}" not found at position ${position}`);
      return;
    }

    // Create the replacement element
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

  // If no valid replacements, return original content
  if (replacements.length === 0) {
    return renderContent ? <>{renderContent(content)}</> : <span>{content}</span>;
  }

  // Build the final content with vocabulary links
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Sort replacements by start position
  const sortedReplacements = replacements.sort((a, b) => a.start - b.start);

  // Instead of processing segments, let's replace vocabulary words with placeholder markers
  // and let the renderContent function handle the full text with placeholders
  
  let processedContent = content;
  const placeholders: { [key: string]: React.ReactNode } = {};
  
  sortedReplacements.forEach((replacement, index) => {
    const placeholder = `__VOCAB_${index}__`;
    placeholders[placeholder] = replacement.element;
    
    // Replace the word with placeholder
    const before = processedContent.slice(0, replacement.start);
    const after = processedContent.slice(replacement.end);
    processedContent = before + placeholder + after;
    
    // Adjust positions for subsequent replacements
    const lengthDiff = placeholder.length - (replacement.end - replacement.start);
    for (let i = index + 1; i < sortedReplacements.length; i++) {
      sortedReplacements[i].start += lengthDiff;
      sortedReplacements[i].end += lengthDiff;
    }
  });

  // If we have a renderContent function, use it for the full processed content
  if (renderContent) {
    const renderedContent = renderContent(processedContent);
    
    // Now we need to replace placeholders in the rendered React elements
    // This is complex, so let's use a simpler approach for now
    return <>{renderedContent}</>;
  }

  // Fallback: manually replace placeholders
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