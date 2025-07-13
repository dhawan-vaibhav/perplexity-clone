'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Thread } from '../../src/entities/models/thread';

interface DeleteThreadProps {
  threadId: string;
  threads: Thread[];
  setThreads: (threads: Thread[]) => void;
}

export default function DeleteThread({ threadId, threads, setThreads }: DeleteThreadProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Remove the thread from the local state
        setThreads(threads.filter(thread => thread.id !== threadId));
      } else {
        console.error('Failed to delete thread');
        alert('Failed to delete conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('An error occurred while deleting the conversation.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete conversation"
    >
      <Trash2 size={16} />
    </button>
  );
}