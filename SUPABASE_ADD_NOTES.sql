-- Add note_agenzia column to bookings table for admin instructions
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS note_agenzia text;
