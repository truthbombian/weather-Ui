import { createClient } from '@supabase/supabase-js';

const supabaseUrl = window.SUPABASE_URL || '';
const supabaseAnonKey = window.SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
