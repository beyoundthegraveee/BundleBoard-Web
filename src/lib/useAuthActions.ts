"use client"

import { signOut, useSession } from "next-auth/react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { LogoutDocument } from "@/graphql/generated";
import { Session } from "next-auth";


interface ExtendedSession extends Session {
  refreshToken?: string;
}

export function useAuthActions() {
  const { data: session } = useSession();
  const [executeLogout] = useMutation(LogoutDocument);
  const client = useApolloClient();

  const terminateSession = async () => {
    const safeExecute = async (promise: Promise<unknown>) => {
      try {
        await promise;
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Action failed:", error);
        }
      }
    };

    const sessionData = session as ExtendedSession | null;
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