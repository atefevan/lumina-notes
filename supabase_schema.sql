/*
  SUPABASE SQL SCHEMA
  
  Run the following SQL in your Supabase SQL Editor to set up the database tables.
  
  -- 1. Create Notes Table
  CREATE TABLE notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  -- 2. Create Reminders Table
  CREATE TABLE reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority TEXT DEFAULT 'medium',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  -- 3. Enable Row Level Security (RLS)
  ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

  -- 4. Create Policies for Notes
  CREATE POLICY "Users can view their own notes" ON notes
    FOR SELECT USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can insert their own notes" ON notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Users can update their own notes" ON notes
    FOR UPDATE USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can delete their own notes" ON notes
    FOR DELETE USING (auth.uid() = user_id);

  -- 5. Create Policies for Reminders
  CREATE POLICY "Users can view their own reminders" ON reminders
    FOR SELECT USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can insert their own reminders" ON reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Users can update their own reminders" ON reminders
    FOR UPDATE USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can delete their own reminders" ON reminders
    FOR DELETE USING (auth.uid() = user_id);

  -- 6. Storage Policies for 'images' bucket
  -- Note: Ensure the 'images' bucket is created in the Supabase Dashboard first.
  
  CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images' AND (auth.role() = 'authenticated'));

  CREATE POLICY "Allow public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');

  CREATE POLICY "Allow authenticated updates"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images' AND (auth.role() = 'authenticated'));

  CREATE POLICY "Allow authenticated deletes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'images' AND (auth.role() = 'authenticated'));
*/
