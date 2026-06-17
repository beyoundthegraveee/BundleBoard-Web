"use client"
import { signOut, useSession } from "next-auth/react";
import { useMutation, useApolloClient } from "@apollo/client/react";
import { LogoutDocument } from "@/graphql/generated";

export function useAuthActions() {
  const { data: session } = useSession();
  const [executeLogout] = useMutation(LogoutDocument);
  const client = useApolloClient();

  const terminateSession = async () => {
    const sessionData = session as any;
    const refreshToken = sessionData?.refreshToken;

    if (refreshToken) {
      try {
        await executeLogout({
          variables: { input: { refreshToken } }
        });
      } catch (error) {
        console.error("Failed to invalidate session on server:", error);
      }
    }

    await client.resetStore();
    localStorage.removeItem("user-profile");
    await signOut({ callbackUrl: "/" });
  };

  return { terminateSession };
}