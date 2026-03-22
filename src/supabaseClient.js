import { createClient } from "@supabase/supabase-js";

// --- PASTE YOUR SUPABASE CREDENTIALS HERE ---
const SUPABASE_URL = "https://spvwwkutmpiadtxiluuc.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_0mm294Fh_9iMd0QminoLpw_xGL-KdDU";
// --------------------------------------------

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
