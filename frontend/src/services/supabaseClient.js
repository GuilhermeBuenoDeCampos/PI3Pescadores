import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholderKey = supabaseAnonKey === 'sua-anon-public-key';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !isPlaceholderKey);

export const supabaseConfigError =
  'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo frontend/.env.';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
