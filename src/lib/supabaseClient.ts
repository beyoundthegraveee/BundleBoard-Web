import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

declare global {
  var globalSupabase: SupabaseClient | undefined
}


export const supabase = globalThis.globalSupabase || createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.globalSupabase = supabase
}