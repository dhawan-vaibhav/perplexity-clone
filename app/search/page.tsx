'use client';

import { useSearchParams } from 'next/navigation';
import ChatWindow from "../../components/chat/ChatWindow";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  return <ChatWindow initialQuery={query || undefined} />;
}