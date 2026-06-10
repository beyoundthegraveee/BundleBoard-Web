"use client";

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { ApolloProvider } from "@apollo/client/react";

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
            merge(existing = {}, incoming) {
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

    const authLink = new SetContextLink((prevContext) => {
      const token = (session as any)?.accessToken;
      
      return {
        headers: {
          ...prevContext.headers,
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