-- Create a function to check email uniqueness across developers and companies
CREATE OR REPLACE FUNCTION check_email_uniqueness() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if email exists in developers table (when inserting/updating companies)
  IF TG_TABLE_NAME = 'companies' THEN
    IF EXISTS (SELECT 1 FROM developers WHERE LOWER(email) = LOWER(NEW.email) AND email IS NOT NULL) THEN
      RAISE EXCEPTION 'Email already exists in developers table';
    END IF;
  END IF;
  
  -- Check if email exists in companies table (when inserting/updating developers)
  IF TG_TABLE_NAME = 'developers' THEN
    IF EXISTS (SELECT 1 FROM companies WHERE LOWER(contact_email) = LOWER(NEW.email) AND contact_email IS NOT NULL) THEN
      RAISE EXCEPTION 'Email already exists in companies table';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to enforce email uniqueness
CREATE TRIGGER trigger_check_developer_email_uniqueness
  BEFORE INSERT OR UPDATE ON developers
  FOR EACH ROW
  WHEN (NEW.email IS NOT NULL)
  EXECUTE FUNCTION check_email_uniqueness();

CREATE TRIGGER trigger_check_company_email_uniqueness
  BEFORE INSERT OR UPDATE ON companies
  FOR EACH ROW
  WHEN (NEW.contact_email IS NOT NULL)
  EXECUTE FUNCTION check_email_uniqueness();