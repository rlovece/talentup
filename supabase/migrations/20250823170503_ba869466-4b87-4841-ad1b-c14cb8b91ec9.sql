-- Crear política para que cualquier usuario autenticado pueda ver los CVs
CREATE POLICY "Authenticated users can view CVs" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'cvs');

-- Crear política para que los developers puedan subir sus propios CVs
CREATE POLICY "Developers can upload their own CVs" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Crear política para que los developers puedan actualizar sus propios CVs
CREATE POLICY "Developers can update their own CVs" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Crear política para que los developers puedan eliminar sus propios CVs
CREATE POLICY "Developers can delete their own CVs" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'cvs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);