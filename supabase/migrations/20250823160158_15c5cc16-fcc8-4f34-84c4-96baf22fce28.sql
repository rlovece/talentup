-- Create sectors table similar to skills but for companies (single selection in app)
CREATE TABLE IF NOT EXISTS public.sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

-- Policies: mirror skills (public read, authenticated can insert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sectors' AND policyname = 'Anyone can view sectors'
  ) THEN
    CREATE POLICY "Anyone can view sectors"
    ON public.sectors
    FOR SELECT
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'sectors' AND policyname = 'Users can insert sectors'
  ) THEN
    CREATE POLICY "Users can insert sectors"
    ON public.sectors
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
END $$;

-- Optional helpful index for lookups (case-insensitive search)
CREATE INDEX IF NOT EXISTS idx_sectors_name_lower ON public.sectors (lower(name));