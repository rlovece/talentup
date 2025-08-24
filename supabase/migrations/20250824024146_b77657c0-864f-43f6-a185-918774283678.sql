-- Add read status column to contacts table
ALTER TABLE public.contacts 
ADD COLUMN read BOOLEAN NOT NULL DEFAULT false;

-- Set all existing contacts to unread
UPDATE public.contacts 
SET read = false;