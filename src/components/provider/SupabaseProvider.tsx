"use client";

import { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Session } from "next-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const supabase = useMemo(() => {
    const token = (session as Session & { supabaseToken?: string })?.supabaseToken;
    
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, 
        autoRefreshToken: false,
      },
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    });
  }, [session]);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}