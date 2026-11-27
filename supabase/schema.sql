-- ========================================================
-- TANUR HERITAGE - SUPABASE DATABASE & STORAGE SCHEMA
-- ========================================================
-- Run this script in your Supabase project's SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Create table for Carnival & Programme Registrations
CREATE TABLE IF NOT EXISTS public.carnival_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT NOT NULL, -- 'participant' or 'presentation'
    programme TEXT NOT NULL,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT NOT NULL,
    institution TEXT NOT NULL,
    topic TEXT, -- For research presentation
    proposal_files JSONB DEFAULT '[]'::jsonb, -- Array of { name, size, url, path }
    status TEXT DEFAULT 'pending' -- 'pending', 'approved', 'reviewed'
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_carnival_reg_created_at ON public.carnival_registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_carnival_reg_type ON public.carnival_registrations (type);
CREATE INDEX IF NOT EXISTS idx_carnival_reg_programme ON public.carnival_registrations (programme);

-- Enable Row Level Security (RLS)
ALTER TABLE public.carnival_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public / anon users to submit their registration
CREATE POLICY "Allow public registration insert"
ON public.carnival_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow public / anon to view their own or allow admin reads
CREATE POLICY "Allow admin and public select"
ON public.carnival_registrations
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Create Storage Bucket for Uploaded Proposals
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposals', 'proposals', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload proposal files into 'proposals' bucket
CREATE POLICY "Allow public proposal uploads"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'proposals');

-- Allow public viewing/downloading of proposal files
CREATE POLICY "Allow public proposal downloads"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'proposals');
