-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert basic profile with role from metadata
  INSERT INTO public.profiles (user_id, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'role', 'developer')::public.user_role
  );
  
  -- If developer, create developer record
  IF COALESCE(new.raw_user_meta_data ->> 'role', 'developer')::public.user_role = 'developer' THEN
    INSERT INTO public.developers (user_id, name, email)
    VALUES (new.id, new.raw_user_meta_data ->> 'name', new.email);
  END IF;
  
  -- If company, create company record
  IF COALESCE(new.raw_user_meta_data ->> 'role', 'developer')::public.user_role = 'company' THEN
    INSERT INTO public.companies (user_id, name, contact_email)
    VALUES (new.id, new.raw_user_meta_data ->> 'name', new.email);
  END IF;
  
  RETURN new;
END;
$$;

-- Fix update function search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;