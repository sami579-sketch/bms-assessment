-- BMS Assessment — Supabase Schema
-- Run this in your Supabase project's SQL Editor

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,

  -- Patient details
  patient_name TEXT NOT NULL,
  patient_age TEXT,
  patient_height TEXT,
  patient_phone TEXT,

  -- Assessor details
  assessor_name TEXT NOT NULL,
  assessor_email TEXT NOT NULL,
  assessment_date TEXT NOT NULL,

  -- Assessment form data (stored as JSON)
  wheelchair_data JSONB,
  standing_data JSONB,

  -- Status: draft | complete | sent
  status TEXT DEFAULT 'draft'
);

-- Enable Row Level Security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (adjust once you add auth)
CREATE POLICY "Allow all operations" ON assessments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for common queries
CREATE INDEX IF NOT EXISTS assessments_created_at_idx ON assessments (created_at DESC);
CREATE INDEX IF NOT EXISTS assessments_assessor_email_idx ON assessments (assessor_email);
CREATE INDEX IF NOT EXISTS assessments_patient_name_idx ON assessments (patient_name);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
