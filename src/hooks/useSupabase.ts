import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function useSupabase() {
  const { data: session } = useSession();

  const supabase = useMemo(() => {
    const sessionData = session as any;
    const token = sessionData?.supabaseToken;

    const options: any = {
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

  return supabase;
}