-- Create contacts table to track company-developer interactions
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id UUID NOT NULL,
  company_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign keys to reference developers and companies tables
  CONSTRAINT fk_contacts_developer FOREIGN KEY (developer_id) REFERENCES public.developers(id) ON DELETE CASCADE,
  CONSTRAINT fk_contacts_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Companies can insert contacts
CREATE POLICY "Companies can insert contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = contacts.company_id 
    AND c.user_id = auth.uid()
  )
);

-- Policy: Developers can view their own contacts
CREATE POLICY "Developers can view their own contacts" 
ON public.contacts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.developers d 
    WHERE d.id = contacts.developer_id 
    AND d.user_id = auth.uid()
  )
);

-- Policy: Companies can view contacts they created
CREATE POLICY "Companies can view their own contacts" 
ON public.contacts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.companies c 
    WHERE c.id = contacts.company_id 
    AND c.user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_contacts_developer_id ON public.contacts(developer_id);
CREATE INDEX idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);