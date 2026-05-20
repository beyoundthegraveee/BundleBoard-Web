"use client"
import { signOut, useSession } from "next-auth/react";
import { performLogout } from "@/lib/NextAuthOptions";

export function useAuthActions() {
  const { data: session } = useSession();

  const terminateSession = async () => {
    const sessionData = session as any;
    const accessToken = sessionData?.accessToken;
    const refreshToken = sessionData?.refreshToken;

    if (accessToken && refreshToken) {
      await performLogout(refreshToken, accessToken);
    }
    
    await signOut({ callbackUrl: "/" });
  };

  return { terminateSession };
}