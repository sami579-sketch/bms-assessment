-- BMS Assessment — schema migration v2
-- Run this ONCE in your Supabase project's SQL Editor BEFORE deploying the dashboard update.
-- It is safe to run more than once (uses "if not exists").

-- 1) Persist product + client (these were never being saved before) and the stored PDF path.
alter table assessments add column if not exists product  text;
alter table assessments add column if not exists client   text;
alter table assessments add column if not exists pdf_path  text;

-- 2) Helpful indexes for the dashboard filters/search.
create index if not exists assessments_status_idx  on assessments (status);
create index if not exists assessments_client_idx  on assessments (client);
create index if not exists assessments_product_idx on assessments (product);

-- ── Storage (do this in the dashboard UI, not SQL) ─────────────────────────────
-- Supabase → Storage → New bucket:
--   Name:   assessment-pdfs
--   Public: OFF  (private — the app serves PDFs via short-lived signed URLs)
