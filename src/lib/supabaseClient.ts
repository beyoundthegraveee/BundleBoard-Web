import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

declare global {
  var globalSupabase: SupabaseClient | undefined
}


export const supabase = globalThis.globalSupabase || createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalSupabase = supabase
}