-- Make the cvs bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'cvs';