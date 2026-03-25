# Supabase Row Level Security (RLS) Policies

To enforce data privacy and security (crucial for medical data compliance like HIPAA and Google Play User Data policies), the following RLS policies must be executed in your Supabase SQL Editor.

## 1. Enable RLS on all tables
```sql
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE radiographs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
```

## 2. Patients Policy
Users can only read and manage their own created patients' records.
```sql
CREATE POLICY "Users can manage their own patients" 
ON patients FOR ALL
USING (auth.uid() = user_id);
```

## 3. Radiographs Policy
Users can only upload and view their own uploaded radiographs.
```sql
CREATE POLICY "Users can manage their own radiographs" 
ON radiographs FOR ALL
USING (auth.uid() = user_id);
```

## 4. Analyses Policy
Users can only view and generate analysis records that belong to them.
```sql
CREATE POLICY "Users can manage their own analyses" 
ON analyses FOR ALL
USING (auth.uid() = user_id);
```

## 5. Storage Bucket (radiographs) Policy
Ensure the storage bucket is private, and only authenticated users can upload or read their own files.
```sql
-- Allow upload to 'radiographs' bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'radiographs' AND auth.uid() = owner);

-- Allow reading own uploads
CREATE POLICY "Allow reading own objects"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'radiographs' AND auth.uid() = owner);
```
