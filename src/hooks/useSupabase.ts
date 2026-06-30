"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { createClient, SupabaseClientOptions } from "@supabase/supabase-js";
import { Session } from "next-auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function useSupabase() {
  const { data: session } = useSession();

  return useMemo(() => {
    const token = (session as Session | null)?.supabaseToken;
    const options: SupabaseClientOptions<"public"> = {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    };

    if (token) {
      options.global = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }

    return createClient(supabaseUrl, supabaseAnonKey, options);
  }, [session]);
}