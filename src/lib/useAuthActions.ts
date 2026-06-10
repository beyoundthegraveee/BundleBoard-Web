"use client"

import { signOut, useSession } from "next-auth/react";
import { useMutation } from "@apollo/client/react" 
import { LogoutDocument } from "@/graphql/generated";

export function useAuthActions() {
  const { data: session } = useSession();
  const [executeLogout] = useMutation(LogoutDocument);

  const terminateSession = async () => {
    const sessionData = session as any;
    const refreshToken = sessionData?.refreshToken;

    if (refreshToken) {
      try {
        await executeLogout({
          variables: {
            input: { refreshToken }
          }
        });
      } catch (error) {
        console.error("Failed to invalidate session on server:", error);
      }
    }
    await signOut({ callbackUrl: "/" });
  };

  return { terminateSession };
}