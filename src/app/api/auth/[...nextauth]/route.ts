import NextAuth from "next-auth";
import { authOptions } from "@/lib/NextAuthOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };