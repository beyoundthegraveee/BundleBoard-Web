import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { print } from 'graphql'; 
import jwt from 'jsonwebtoken';

import {
  LoginMutation,
  LoginMutationVariables,
  SocialLoginMutation,
  SocialLoginMutationVariables,
  RefreshTokenMutation,
  RefreshTokenMutationVariables,
  LogoutMutation,
  LogoutMutationVariables,
  LoginDocument,
  SocialLoginDocument,
  RefreshTokenDocument,
  LogoutDocument
} from '@/graphql/generated';
import Email from 'next-auth/providers/email';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql";
const ACCESS_TOKEN_EXPIRY_MS = parseInt(process.env.JWT_ACCESS_EXPIRY_MS || "900000", 10);

async function gqlRequest<T, V>(queryDocument: any, variables: V, accessToken?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  const queryString = typeof queryDocument === 'string' 
    ? queryDocument 
    : print(queryDocument);

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: queryString, variables }),
  });

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  return result.data as T;
}

export async function performLogout(refreshToken: string, accessToken: string) {
  try {
    await gqlRequest<LogoutMutation, LogoutMutationVariables>(
      LogoutDocument,
      { input: { refreshToken } },
      accessToken
    );
  } catch (err) {
    console.error("LOGOUT_SERVER_ERROR:", err);
  }
}

async function refreshAccessToken(token: any) {
  try {
    const data = await gqlRequest<RefreshTokenMutation, RefreshTokenMutationVariables>(
      RefreshTokenDocument,
      { input: { refreshToken: token.refreshToken } }
    );

    if (!data?.refreshToken) {
      throw new Error("Failed to refresh token: No data returned");
    }

    return {
      ...token,
      accessToken: data.refreshToken.accessToken,
      refreshToken: data.refreshToken.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRY_MS,
    };
  } catch (error) {
    console.error("CRITICAL_REFRESH_ERROR:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialProvider({
      name: "Sign In",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const data = await gqlRequest<LoginMutation, LoginMutationVariables>(
          LoginDocument,
          { 
            input: { 
              username: credentials?.username || "", 
              password: credentials?.password || "" 
            } 
          }
        );

        const authData = data?.login;

        if (!authData || authData.error) {
          throw new Error(authData?.error || "Invalid credentials");
        }

        return {
          id: authData.user.id,
          name: credentials?.username as string,
          email: authData.user.email,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          isNewUser: authData.isNew,
          roles: authData.user.roles || []
        } as any;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const data = await gqlRequest<SocialLoginMutation, SocialLoginMutationVariables>(
            SocialLoginDocument,
            {
              input: {
                email: user.email || "",
                username: user.name || user.email?.split("@")[0] || "",
                provider: account.provider
              }
            }
          );

          const socialData = data?.socialLogin;

          if (socialData?.accessToken) {
            const u = user as any;
            u.id = socialData.user?.id;
            u.accessToken = socialData.accessToken;
            u.refreshToken = socialData.refreshToken;
            u.isNewUser = socialData.isNew;
            u.roles = socialData.user?.roles || [];
            return true;
          }
          return false;

        } catch (error: any) {
          if (error.message === "User not found") {
            const email = encodeURIComponent(user.email || '');
            const username = encodeURIComponent(user.name || user.email?.split("@")[0] || '');
            return `/register?mode=social-setup&email=${email}&username=${username}`;
          }

          console.error("Error during social login:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, session, trigger }) {
      if (user) {
        token.id = user.id;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.isNewUser = (user as any).isNewUser;
        token.roles = (user as any).roles || [];
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_EXPIRY_MS;

        const supabasePayload = {
          aud: "authenticated",
          exp: Math.floor((Date.now() + ACCESS_TOKEN_EXPIRY_MS) / 1000),
          sub: user.id,
          email: user.email,
          role: "authenticated"
        };

        token.supabaseToken = jwt.sign(
          supabasePayload,
          process.env.SUPABASE_JWT_SECRET!,
          { algorithm: 'HS256'}
        );

        return token;
      }

      if (trigger === "update" && session) {
        if (session.isNewUser !== undefined) token.isNewUser = session.isNewUser;
        if (session.roles) token.roles = session.roles;
      }

      if (Date.now() < (token.accessTokenExpires as number) - 60 * 1000) {
        return token;
      }

      const refreshedToken = await refreshAccessToken(token);
      if(refreshedToken && !refreshedToken.error) {
        const supabasePayload = {
          aud: "authenticated",
          exp: Math.floor((refreshedToken.accessTokenExpires as number) / 1000),
          sub: refreshedToken.id,
          email: refreshedToken.email,
          role: "authenticated",
        };
        refreshedToken.supabaseToken = jwt.sign(
          supabasePayload,
          process.env.SUPABASE_JWT_SECRET!,
          { algorithm: 'HS256'}
        )
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      const s = session as any;
      s.accessToken = token.accessToken;
      s.supabaseToken = token.supabaseToken;
      s.isNewUser = token.isNewUser;
      s.error = token.error;
      s.refreshToken = token.refreshToken;

      if (s.user) {
        s.user.roles = token.roles || [];
        s.user.id = (token as any).id || token.sub;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};