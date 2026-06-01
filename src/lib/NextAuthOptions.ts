import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const ACCESS_TOKEN_EXPIRY_MS = parseInt(process.env.JWT_ACCESS_EXPIRY_MS || "900000", 10);

const SOCIAL_LOGIN_MUTATION = `
  mutation SocialLogin($input: SocialLoginRequest!) {
    socialLogin(input: $input) {
      accessToken
      refreshToken
      isNew
      error
      user { id username email roles }
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($input: AuthRequest!) {
    login(input: $input) {
      accessToken
      refreshToken
      error
      user { id username email roles }
      isNew
    }
  }
`;

const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($input: RefreshTokenRequest!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

const LOGOUT_MUTATION = `
  mutation Logout($input: RefreshTokenRequest!) {
    logout(input: $input)
  }
`;

export async function performLogout(refreshToken: string, accessToken: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql";
    await fetch(apiUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}` 
      },
      body: JSON.stringify({
        query: LOGOUT_MUTATION,
        variables: { input: { refreshToken } }
      })
    });
  } catch (err) {
    console.error("LOGOUT_SERVER_ERROR:", err);
  }
}

async function refreshAccessToken(token: any) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql";
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: REFRESH_TOKEN_MUTATION,
        variables: { input: { refreshToken: token.refreshToken } },
      }),
    });

    const refreshedTokens = await response.json();

    if (refreshedTokens.errors) {
      throw new Error(refreshedTokens.errors[0].message || "Failed to refresh token");
    }

    const { accessToken, refreshToken } = refreshedTokens.data?.refreshToken || {};

    return {
      ...token,
      accessToken: accessToken,
      refreshToken: refreshToken ?? token.refreshToken,
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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql";
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: LOGIN_MUTATION,
            variables: {
              input: {
                username: credentials?.username,
                password: credentials?.password,
              },
            },
          }),
        })

        const result = await res.json()

        if (result.errors) {
          throw new Error(result.errors[0].message || "Server error")
        }

        const authData = result.data?.login

        if (!authData || authData.error) {
          throw new Error(authData?.error || "Invalid credentials")
        }

        return {
          id: authData.user?.id,
          name: credentials?.username as string,
          email: authData.user?.email,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          isNewUser: authData.isNew,
          roles: authData.user?.roles || []
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql";
        try {
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: SOCIAL_LOGIN_MUTATION,
              variables: {
                input: {
                  email: user.email,
                  username: user.name || user.email?.split("@")[0],
                  provider: account.provider
                }
              }
            })
          });

          const result = await res.json();

          if (result.errors && result.errors.length > 0) {
            const errMsg = result.errors[0].message;

            if (errMsg === "User not found") {
              const email = encodeURIComponent(user.email || '');
              const username = encodeURIComponent(user.name || user.email?.split("@")[0] || '');
              return `/register?mode=social-setup&email=${email}&username=${username}`;
            }

            console.error("GraphQL Signin Error:", result.errors);
            return false;
          }

          const socialData = result.data?.socialLogin;

          if (socialData?.accessToken) {
            const u = user as any;
            u.accessToken = socialData.accessToken;
            u.refreshToken = socialData.refreshToken;
            u.isNewUser = socialData.isNew;
            u.roles = socialData.user?.roles || [];
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error during social login:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, session, trigger }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.isNewUser = (user as any).isNewUser;
        token.roles = (user as any).roles || [];
        token.accessTokenExpires = Date.now() + ACCESS_TOKEN_EXPIRY_MS;
        return token;
      }

      if (trigger === "update" && session) {
        if (session.isNewUser !== undefined) {
          token.isNewUser = session.isNewUser;
        }
        if (session.roles) {
          token.roles = session.roles;
        }
      }

      if (Date.now() < (token.accessTokenExpires as number) - 60 * 1000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      const s = session as any;
      s.accessToken = token.accessToken;
      s.isNewUser = token.isNewUser;
      s.error = token.error;
      s.refreshToken = token.refreshToken;

      if (s.user) {
        s.user.roles = token.roles || [];
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