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

    // Передаем два аргумента: дескриптор операции и объект предыдущего контекста
    const authLink = new SetContextLink((operation: any, prevContext: any) => {
      const prevHeaders = prevContext.headers || {};

      // 1. Автоматическая проверка: отключаем заголовки для публичных страниц
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
          return {
            headers: prevHeaders,
          };
        }
      }

      // 2. Ручная проверка: если у мутации/квери выставлен контекст context: { skipAuth: true }
      if (prevContext.skipAuth) {
        return {
          headers: prevHeaders,
        };
      }

      // Если страница приватная — подставляем JWT токен из сессии NextAuth
      const token = (session as any)?.accessToken;
      
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