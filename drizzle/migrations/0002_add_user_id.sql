-- Add userId column to threads table
ALTER TABLE threads ADD COLUMN user_id TEXT NOT NULL DEFAULT 'temp';

-- Remove the default after adding the column
ALTER TABLE threads ALTER COLUMN user_id DROP DEFAULT;

-- Add index for performance
CREATE INDEX idx_threads_user_id ON threads(user_id);

-- Add userId column to thread_items table (optional, for direct queries)
ALTER TABLE thread_items ADD COLUMN user_id TEXT;

-- Add index for thread_items
CREATE INDEX idx_thread_items_user_id ON thread_items(user_id);