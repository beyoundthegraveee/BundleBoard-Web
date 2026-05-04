import NextAuth, {type NextAuthOptions} from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';

const SOCIAL_LOGIN_MUTATION = `
  mutation SocialLogin($email: String!, $username: String!, $provider: String!) {
    socialLogin(email: $email, username: $username, provider: $provider) {
      accessToken
      refreshToken
      user { id username email }
    }
  }
`;

const LOGIN_MUTATION = `
  mutation Login($input: AuthRequest!) {
    login(input: $input) {
      accessToken
      refreshToken
      error
      user { id username email }
    }
  }
`;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
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
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/graphql";
        try {
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: SOCIAL_LOGIN_MUTATION,
              variables: {
                email: user.email,
                username: user.name || user.email?.split("@")[0],
                provider: account.provider
              }
            })
          });

          const result = await res.json()
          const socialData = result.data?.socialLogin

          if(socialData?.accessToken) {
            (user as any).accessToken = socialData.accessToken
            (user as any).refreshToken = socialData.refreshToken
            return true
          }
          return false
          
        } catch (error) {
          console.error("Error during social login:", error)
          return false
        }
      }
    return true
    },
    async jwt({ token, user }) {
      if (user) {
        return {
            ...token,
            accessToken: (user as any).accessToken,
            refreshToken: (user as any).refreshToken,
        }
    }

      return token
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}