"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useMemo } from "react";
import { ApolloProvider } from "@apollo/client/react";

interface ExtendedSession extends Session {
  accessToken?: string;
}

interface ApolloContext {
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
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

    const authLink = new SetContextLink((prevContext, _operation) => {
    const context = prevContext as ApolloContext;
    const prevHeaders = context.headers || {};

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

    if (context.skipAuth) {
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

  
  useMemo(() => {
    if (!session) {
      cache.reset();
    }
  }, [session, cache]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}