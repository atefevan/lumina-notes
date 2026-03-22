import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://spvwwkutmpiadtxiluuc.supabase.co';
const SUPABASE_PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_0mm294Fh_9iMd0QminoLpw_xGL-KdDU';

if (typeof window !== 'undefined') {
  console.log('Supabase initialized with URL:', SUPABASE_URL.substring(0, 15) + '...');
}

/**
 * Supabase Client Instance
 * 
 * To use your own Supabase project:
 * 1. Go to your Supabase Dashboard -> Project Settings -> API
 * 2. Copy the 'Project URL' and 'anon public' key
 * 3. Update the variables above or set them in your environment variables
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
