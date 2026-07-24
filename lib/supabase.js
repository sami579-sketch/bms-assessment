import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Supabase schema SQL (run this in your Supabase SQL editor):
/*
create table assessments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  patient_name text not null,
  patient_age text,
  patient_height text,
  patient_phone text,
  assessor_name text not null,
  assessor_email text not null,
  assessment_date text not null,
  wheelchair_data jsonb,
  standing_data jsonb,
  status text default 'draft'
);

-- Enable RLS
alter table assessments enable row level security;

-- Allow all operations (adjust based on your auth setup)
create policy "Allow all" on assessments for all using (true);
*/
