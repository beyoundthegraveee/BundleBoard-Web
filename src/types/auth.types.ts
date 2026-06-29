import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    supabaseToken?: string;
    isNewUser?: boolean;
    error?: string;
    user: {
      id: string;
      roles: string[];
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
    roles: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    isNewUser: boolean;
    roles: string[];
    supabaseToken?: string;
    error?: string;
  }
}