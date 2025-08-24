-- Allow developers to update the read status of their own contacts
CREATE POLICY "Developers can update read status of their own contacts" 
ON public.contacts 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1
  FROM developers d
  WHERE (d.id = contacts.developer_id) AND (d.user_id = auth.uid())
))
WITH CHECK (EXISTS ( 
  SELECT 1
  FROM developers d
  WHERE (d.id = contacts.developer_id) AND (d.user_id = auth.uid())
));