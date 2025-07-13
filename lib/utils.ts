import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeDifference(now: Date, past: string | Date): string {
  const pastDate = typeof past === 'string' ? new Date(past) : past;
  const diffInMs = now.getTime() - pastDate.getTime();
  
  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
  if (days < 30) return `${days} day${days === 1 ? '' : 's'}`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'}`;
}