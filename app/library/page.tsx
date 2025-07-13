'use client';

import { useEffect, useState } from 'react';
import { ClockIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatTimeDifference } from '../../lib/utils';
import { Thread } from '../../src/entities/models/thread';
import DeleteThread from '../../components/library/DeleteThread';
import { useBackground } from '../../contexts/BackgroundContext';

export default function LibraryPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const { setShowGridBackground } = useBackground();

  // Turn off grid background when on library page
  useEffect(() => {
    setShowGridBackground(false);
  }, [setShowGridBackground]);

  useEffect(() => {
    const fetchThreads = async () => {
      setLoading(true);

      try {
        const response = await fetch('/api/threads', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setThreads(data.threads);
        } else {
          console.error('Failed to fetch threads');
        }
      } catch (error) {
        console.error('Error fetching threads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-row items-center justify-center min-h-screen">
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-gray-200 fill-gray-600 dark:text-gray-600 animate-spin dark:fill-gray-300"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100.003 78.2051 78.1951 100.003 50.5908 100C22.9765 99.9972 0.997224 78.018 1 50.4037C1.00281 22.7993 22.8108 0.997224 50.4251 1C78.0395 1.00281 100.018 22.8108 100 50.4251ZM9.08164 50.594C9.06312 73.3997 27.7909 92.1272 50.5966 92.1457C73.4023 92.1642 92.1298 73.4365 92.1483 50.6308C92.1669 27.8251 73.4392 9.0973 50.6335 9.07878C27.8278 9.06026 9.10003 27.787 9.08164 50.594Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4037 97.8624 35.9116 96.9801 33.5533C95.1945 28.8227 92.871 24.3692 90.0681 20.348C85.6237 14.1775 79.4473 9.36872 72.0454 6.45794C64.6435 3.54717 56.3134 2.65431 48.3133 3.89319C45.869 4.27179 44.3768 6.77534 45.014 9.20079C45.6512 11.6262 48.1343 13.0956 50.5786 12.717C56.5073 11.8281 62.5542 12.5399 68.0406 14.7911C73.527 17.0422 78.2187 20.7487 81.5841 25.4923C83.7976 28.5886 85.4467 32.059 86.4416 35.7474C87.1273 38.1189 89.5423 39.6781 91.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col pt-4">
        <div className="flex items-center">
          <Image
            src="/library-icon.svg"
            alt="Library"
            width={24}
            height={24}
            className="text-black dark:text-white"
          />
          <h1 className="text-3xl font-medium p-2 text-black dark:text-white">Library</h1>
        </div>
        <hr className="border-t border-gray-200 dark:border-gray-700 my-4 w-full" />
      </div>
      
      {threads.length === 0 && (
        <div className="flex flex-row items-center justify-center min-h-[400px]">
          <p className="text-black/70 dark:text-white/70 text-sm">
            No conversations found.
          </p>
        </div>
      )}
      
      {threads.length > 0 && (
        <div className="flex flex-col pb-20 lg:pb-2">
          {threads.map((thread, i) => (
            <div
              className={cn(
                'flex flex-col space-y-4 py-6',
                i !== threads.length - 1
                  ? 'border-b border-gray-200 dark:border-gray-700'
                  : '',
              )}
              key={thread.id}
            >
              <Link
                href={`/search/${thread.id}`}
                className="text-black dark:text-white lg:text-xl font-medium truncate transition duration-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
              >
                {thread.title}
              </Link>
              <div className="flex flex-row items-center justify-between w-full">
                <div className="flex flex-row items-center space-x-1 lg:space-x-1.5 text-black/70 dark:text-white/70">
                  <ClockIcon size={15} />
                  <p className="text-xs">
                    {formatTimeDifference(new Date(), thread.createdAt)} ago
                  </p>
                </div>
                <DeleteThread
                  threadId={thread.id}
                  threads={threads}
                  setThreads={setThreads}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}