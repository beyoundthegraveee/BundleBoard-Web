"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useMemo, useEffect, useState, useRef } from "react";
import { ApolloProvider } from "@apollo/client/react";

interface ExtendedSession extends Session {
  accessToken?: string;
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  const prevStatus = useRef(status);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  
  const cache = useMemo(() => new InMemoryCache({
    typePolicies: {
      AuthorShortResponse: {
        keyFields: ["username"], 
      },
      CollectionResponse: {
        fields: {
          author: {
            merge(existing: Record<string, unknown> = {}, incoming: Record<string, unknown>) {
              return { ...existing, ...incoming };
            },
          },
        },
      },
    },
  }), []);

  const client = useMemo(() => {
    const httpLink = new HttpLink({
      uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql",
    });

    const authLink = new SetContextLink((previousContext, _) => {
      const prevHeaders = previousContext.headers || {};

      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        
        const isPublicPath = [
          "/login",
          "/register",
          "/mail/verify-email",
          "/mail/verify",
          "/forgot-password",
          "/select-role"
        ].some(publicPath => path === publicPath) || path.startsWith("/password/reset-password");

        if (isPublicPath) {
          return { headers: prevHeaders };
        }
      }

      if (previousContext.skipAuth) {
        return { headers: prevHeaders };
      }

      const token = (session as ExtendedSession | null)?.accessToken;
      
      return {
        headers: {
          ...prevHeaders,
          authorization: token ? `Bearer ${token}` : "",
        },
      };
    });

    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: cache,
    });
  }, [session, cache]);

  useEffect(() => {
    if (prevStatus.current === "authenticated" && status === "unauthenticated") {
      client.resetStore().catch(console.error);
    }
    prevStatus.current = status;
  }, [session, client]);

  if (!mounted) {
    return null; 
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}