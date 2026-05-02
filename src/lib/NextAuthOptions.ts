import NextAuth, {type NextAuthOptions} from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      name: "Sign In",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/graphql";
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              mutation Login($input: AuthRequest!) {
                login(input: $input) {
                  accessToken
                  refreshToken
                  user { id username email }
                }
              }
            `,
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