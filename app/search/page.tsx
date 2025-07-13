'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatWindow from "../../components/chat/ChatWindow";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  return <ChatWindow initialQuery={query || undefined} />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>}>
      <SearchContent />
    </Suspense>
  );
}