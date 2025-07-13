// Session storage utilities for caching data per user session

export const SessionStorage = {
  // Set data with error handling
  setItem: (key: string, value: any): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
      return false;
    }
  },

  // Get data with error handling and type safety
  getItem: <T>(key: string): T | null => {
    try {
      if (typeof window === 'undefined') return null;
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error);
      return null;
    }
  },

  // Remove specific item
  removeItem: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error);
      return false;
    }
  },

  // Clear all session storage
  clear: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
      return false;
    }
  },

  // Clear all items for a specific session
  clearSession: (sessionId: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.includes(sessionId)) {
          sessionStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.warn('Failed to clear session data:', error);
      return false;
    }
  },

  // Create session-specific cache key
  createKey: (sessionId: string, prefix: string, ...parts: string[]): string => {
    return [prefix, sessionId, ...parts].filter(Boolean).join('-');
  }
};