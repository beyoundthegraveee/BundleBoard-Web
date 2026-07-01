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
  LoginDocument, SocialLoginDocument, RefreshTokenDocument, 
  SocialRegisterDocument, SocialRegisterMutation, SocialRegisterMutationVariables
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
  if (!token.refreshToken) {
    console.warn("[NextAuth] Intercepted token refresh execution: missing refreshToken property.");
    return { ...token, error: "RefreshAccessTokenError" };
  }

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
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const data = await gqlRequest<LoginMutation, LoginMutationVariables>(
          LoginDocument,
          { input: { identifier: credentials?.identifier || "", password: credentials?.password || "" } }
        );

        const authData = data?.login;
        if (!authData || authData.error) throw new Error(authData?.error || "Invalid credentials");
        return {
          id: authData.user.id,
          name: authData.user.username || null,
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
          console.log(`[NextAuth] Initiating Google OAuth profile evaluation for: ${user.email}`);
          
          const data = await gqlRequest<SocialLoginMutation, SocialLoginMutationVariables>(
            SocialLoginDocument,
            { input: { email: user.email || "", username: user.name || "", provider: account.provider } }
          );

          const socialData = data?.socialLogin;
          if (socialData?.accessToken) {
            console.log(`[NextAuth] Social sign-in authenticated for verified profile: ${user.email}`);
            const u = user as User;
            u.id = socialData.user?.id || user.id;
            u.accessToken = socialData.accessToken;
            u.refreshToken = socialData.refreshToken ?? "";
            u.isNewUser = socialData.isNew ?? false;
            u.roles = socialData.user?.roles || [];
            return true;
          }

          console.warn("[NextAuth] Target system returned an unmapped state missing an access token.");
          return false;
        } catch (error: unknown) {
          const errorMsg = error instanceof Error ? error.message : "Unknown verification workflow exception";
          console.log(`[NextAuth] Core validation response for ${user.email}: ${errorMsg}`);

          if (errorMsg.toLowerCase().includes("not found")) {
            try {
              console.log(`[NextAuth] Profile matching records not found. Initializing automated registration routing for: ${user.email}`);
              
              const randomPassword = Math.random().toString(36).slice(-10) + "A1!";
              const fallbackUsername = user.name || user.email?.split('@')[0] || "google_user";

              const regData = await gqlRequest<SocialRegisterMutation, SocialRegisterMutationVariables>(
                SocialRegisterDocument,
                {
                  input: {
                    username: fallbackUsername,
                    email: user.email || "",
                    password: randomPassword,
                    role: "client"
                  }
                }
              );
              
              const regSocialData = regData?.socialRegister;
              if (regSocialData?.accessToken) {
                console.log(`[NextAuth] Core profile successfully provisioned via automated mutation workflow for: ${user.email}`);
                const u = user as User;
                u.id = user.id;
                u.accessToken = regSocialData.accessToken;
                u.refreshToken = regSocialData.refreshToken ?? "";
                u.isNewUser = true;
                u.roles = ['client'];
                return true;
              }
              
              console.warn("[NextAuth] Profile mutation process responded without delivering functional tokens.");
              return false;
            } catch (regError) {
              console.error("[NextAuth] Processing exception raised during automatic inline registration runtime:", regError);
              return false;
            }
          }
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

        const supabaseSecret = process.env.SUPABASE_JWT_SECRET;
    
        if (supabaseSecret && supabaseSecret.trim() !== "") {
          try {
            token.supabaseToken = jwt.sign(
              { aud: "authenticated", sub: formatIdToUUID(user.id), email: user.email, role: "authenticated" },
              supabaseSecret,
              { algorithm: 'HS256' }
            );
          } catch (jwtError) {
            console.error("Supabase JWT signing failed error:", jwtError);
          }
        } else {
          console.warn("Supabase JWT is missing! Skipping Supabase token generation.");
        }

        return token;
      }

      if (trigger === "update" && session) {
        if (session.isNewUser !== undefined) token.isNewUser = session.isNewUser;
        if (session.roles) token.roles = session.roles;

        try {
          console.log("[NextAuth] Role update triggered. Forcing backend token rotation...");
          const refreshed = await refreshAccessToken(token);
          return refreshed;
        } catch (refreshError) {
          console.error("[NextAuth] Failed to force token rotation on update:", refreshError);
        }
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - 60 * 1000) return token;

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