"use client"

import { signOut, useSession } from "next-auth/react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { LogoutDocument } from "@/graphql/generated";

export function useAuthActions() {
  const { data: session } = useSession();
  const [executeLogout] = useMutation(LogoutDocument);
  const client = useApolloClient();

  const terminateSession = async () => {
    const safeExecute = async (promise: Promise<any>) => {
      try {
        await promise;
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.error("Action failed:", e);
        }
      }
    };

    const sessionData = session as any;
    const refreshToken = sessionData?.refreshToken;

    if (refreshToken) {
      await safeExecute(executeLogout({
        variables: { input: { refreshToken } },
        errorPolicy: 'ignore'
      }));
    }

    await safeExecute(client.resetStore());
    localStorage.removeItem("user-profile");
    await signOut({ callbackUrl: "/" });
  };

  return { terminateSession };
}