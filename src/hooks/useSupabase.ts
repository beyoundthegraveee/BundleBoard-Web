import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSupabase() {
  const { data: session } = useSession();

  useEffect(() => {
    const sessionData = session as any;
    
    if (sessionData?.supabaseToken) {
      supabase.auth.setSession({
        access_token: sessionData.supabaseToken,
        refresh_token: "",
      });
    }
  }, [session]);

  return supabase;
}