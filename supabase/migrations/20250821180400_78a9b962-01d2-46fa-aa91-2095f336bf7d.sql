-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('developer', 'company');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on skills (public read access)
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skills" 
ON public.skills 
FOR SELECT 
USING (true);

-- Create developers table
CREATE TABLE public.developers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  cv_url TEXT,
  github_link TEXT,
  linkedin_link TEXT,
  skills TEXT[], -- Array of skill names
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on developers
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for developers
CREATE POLICY "Anyone can view developers" 
ON public.developers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own developer profile" 
ON public.developers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own developer profile" 
ON public.developers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  description TEXT,
  contact_email TEXT,
  logo_url TEXT,
  sector TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Anyone can view companies" 
ON public.companies 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own company profile" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company profile" 
ON public.companies 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true),
('cvs', 'cvs', false),
('logos', 'logos', true);

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for CVs
CREATE POLICY "Users can view their own CV" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own CV" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own CV" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for logos
CREATE POLICY "Logo images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

CREATE POLICY "Users can upload their own logo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own logo" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert basic profile with role from metadata
  INSERT INTO public.profiles (user_id, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'role', 'developer')::user_role
  );
  
  -- If developer, create developer record
  IF COALESCE(new.raw_user_meta_data ->> 'role', 'developer')::user_role = 'developer' THEN
    INSERT INTO public.developers (user_id, name, email)
    VALUES (new.id, new.raw_user_meta_data ->> 'name', new.email);
  END IF;
  
  -- If company, create company record
  IF COALESCE(new.raw_user_meta_data ->> 'role', 'developer')::user_role = 'company' THEN
    INSERT INTO public.companies (user_id, name, contact_email)
    VALUES (new.id, new.raw_user_meta_data ->> 'name', new.email);
  END IF;
  
  RETURN new;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create update triggers for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_developers_updated_at
  BEFORE UPDATE ON public.developers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial skills
INSERT INTO public.skills (name) VALUES 
('JavaScript'),
('TypeScript'),
('React'),
('Vue.js'),
('Angular'),
('Node.js'),
('Python'),
('Java'),
('C#'),
('PHP'),
('Ruby'),
('Go'),
('Rust'),
('Swift'),
('Kotlin'),
('Flutter'),
('React Native'),
('HTML/CSS'),
('Sass/SCSS'),
('Tailwind CSS'),
('Bootstrap'),
('MongoDB'),
('PostgreSQL'),
('MySQL'),
('Redis'),
('Docker'),
('Kubernetes'),
('AWS'),
('Azure'),
('Google Cloud'),
('Git'),
('GraphQL'),
('REST APIs'),
('Microservices'),
('DevOps'),
('CI/CD'),
('Testing'),
('Agile/Scrum');