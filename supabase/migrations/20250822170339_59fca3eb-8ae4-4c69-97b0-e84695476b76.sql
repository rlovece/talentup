-- Secure cross-table email uniqueness enforcement
-- 1) Replace function with SECURITY DEFINER and fixed column references
CREATE OR REPLACE FUNCTION public.check_email_uniqueness()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When inserting/updating in companies, ensure contact_email isn't used by any developer
  IF TG_TABLE_NAME = 'companies' THEN
    IF NEW.contact_email IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.developers d
      WHERE d.email IS NOT NULL
        AND LOWER(TRIM(d.email)) = LOWER(TRIM(NEW.contact_email))
    ) THEN
      RAISE EXCEPTION 'Email already exists in developers table';
    END IF;
  END IF;

  -- When inserting/updating in developers, ensure email isn't used by any company
  IF TG_TABLE_NAME = 'developers' THEN
    IF NEW.email IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.contact_email IS NOT NULL
        AND LOWER(TRIM(c.contact_email)) = LOWER(TRIM(NEW.email))
    ) THEN
      RAISE EXCEPTION 'Email already exists in companies table';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Add per-table case-insensitive unique indexes (ignoring NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_developers_email_ci
  ON public.developers ((LOWER(TRIM(email))))
  WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_companies_contact_email_ci
  ON public.companies ((LOWER(TRIM(contact_email))))
  WHERE contact_email IS NOT NULL;