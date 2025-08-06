-- Migration script to make email column nullable in participants table
-- Run this in your Supabase SQL editor

-- First, check if the table exists and what the current constraint is
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'participants' AND column_name = 'email';

-- Drop the NOT NULL constraint if it exists
ALTER TABLE participants ALTER COLUMN email DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'participants' AND column_name = 'email'; 