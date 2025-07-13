"use client";
import { FormEvent, useState } from 'react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const SearchInput = ({ onSearch, isLoading, placeholder = "Ask anything..." }: SearchInputProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query);
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 pr-16 text-black bg-white border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute inset-y-0 right-2 my-2 flex items-center justify-center w-12 h-auto text-white bg-blue-600 rounded-full disabled:bg-gray-400 hover:bg-blue-700 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          )}
        </button>
      </div>
    </form>
  );
};