'use client';

import { Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Thread } from '../../src/entities/models/thread';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Toast } from '@/components/ui/toast';

interface DeleteThreadProps {
  threadId: string;
  threads: Thread[];
  setThreads: (threads: Thread[]) => void;
}

export default function DeleteThread({ threadId, threads, setThreads }: DeleteThreadProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/threads/${threadId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        // Remove the thread from the local state
        setThreads(threads.filter(thread => thread.id !== threadId));
        setIsOpen(false);
      } else {
        console.error('Failed to delete thread');
        setError('Failed to delete conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      setError('An error occurred while deleting the conversation.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <button
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete conversation"
          >
            <Trash2 size={16} />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-xl">Delete Conversation</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base mt-4">
              Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel 
              disabled={isDeleting}
              className="px-4 py-2"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Conversation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </>
  );
}