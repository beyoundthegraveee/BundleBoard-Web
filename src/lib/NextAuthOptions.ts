import { type NextAuthOptions } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { print, DocumentNode } from 'graphql'; 
import jwt from 'jsonwebtoken';
import { formatIdToUUID } from '@/lib/utils';
import { JWT } from 'next-auth/jwt';
import { User } from 'next-auth';
import '@/types/auth.types';

import {
  LoginMutation, LoginMutationVariables,
  SocialLoginMutation, SocialLoginMutationVariables,
  RefreshTokenMutation, RefreshTokenMutationVariables,
  LoginDocument, SocialLoginDocument, RefreshTokenDocument
} from '@/graphql/generated';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql";
const ACCESS_TOKEN_EXPIRY_MS = parseInt(process.env.JWT_ACCESS_EXPIRY_MS || "900000", 10);

async function gqlRequest<T, V>(queryDocument: DocumentNode | string, variables: V, accessToken?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  
  const queryString = typeof queryDocument === 'string' ? queryDocument : print(queryDocument);

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: queryString, variables }),
  });

  const result = await response.json();
  if (result.errors?.length > 0) throw new Error(result.errors[0].message);
  return result.data as T;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const data = await gqlRequest<RefreshTokenMutation, RefreshTokenMutationVariables>(
      RefreshTokenDocument,
      { input: { refreshToken: token.refreshToken } }
    );

    if (!data?.refreshToken) throw new Error("Failed to refresh token");

    return {
      ...token,
      accessToken: data.refreshToken.accessToken,
      refreshToken: data.refreshToken.refreshToken ?? token.refreshToken,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_EXPIRY_MS,
    };
  } catch (error) {
    console.error("CRITICAL_REFRESH_ERROR:", error);
    return { ...token, error: "RefreshAccessTokenError" };
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
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const data = await gqlRequest<LoginMutation, LoginMutationVariables>(
          LoginDocument,
          { input: { username: credentials?.username || "", password: credentials?.password || "" } }
        );

        const authData = data?.login;
        if (!authData || authData.error) throw new Error(authData?.error || "Invalid credentials");
        return {
          id: authData.user.id,
          name: credentials?.username || null,
          email: authData.user.email,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          isNewUser: authData.isNew,
          roles: authData.user.roles || []
        } as User;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const data = await gqlRequest<SocialLoginMutation, SocialLoginMutationVariables>(
            SocialLoginDocument,
            { input: { email: user.email || "", username: user.name || "", provider: account.provider } }
          );

          const socialData = data?.socialLogin;
          if (socialData?.accessToken) {
            const u = user as User;
            u.id = socialData.user?.id || user.id;
            u.accessToken = socialData.accessToken;
            u.refreshToken = socialData.refreshToken ?? "";
            u.isNewUser = socialData.isNew ?? false;
            u.roles = socialData.user?.roles || [];
            return true;
          }
          return false;
        } catch (error: unknown) {
          if (error instanceof Error && error.message === "User not found") return true;
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, session, trigger }) {
      if (user) {
        token.id = user.id;
        token.accessToken = (user as User).accessToken;
        token.refreshToken = (user as User).refreshToken;
        token.isNewUser = (user as User).isNewUser;
        token.roles = (user as User).roles;
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_EXPIRY_MS;

        token.supabaseToken = jwt.sign(
          { aud: "authenticated", sub: formatIdToUUID(user.id), email: user.email, role: "authenticated" },
          process.env.SUPABASE_JWT_SECRET!,
          { algorithm: 'HS256' }
        );
        return token;
      }

      if (trigger === "update" && session) {
        if (session.isNewUser !== undefined) token.isNewUser = session.isNewUser;
        if (session.roles) token.roles = session.roles;
      }

      if (Date.now() < token.accessTokenExpires - 60 * 1000) return token;

      const refreshedToken = await refreshAccessToken(token);
      return refreshedToken;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.supabaseToken = token.supabaseToken;
      session.isNewUser = token.isNewUser;
      session.error = token.error;
      session.refreshToken = token.refreshToken;

      if (session.user) {
        session.user.roles = token.roles || [];
        session.user.id = token.id || session.user.id;
      }
      return session;
    }
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};