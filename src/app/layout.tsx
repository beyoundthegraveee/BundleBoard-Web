import type { Metadata } from "next";
import { Space_Grotesk, Syncopate } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthSessionProvider } from "@/components/provider/SessionProvider";
import { CookieBanner } from "@/components/CookieBanner";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "BUNDLEBOARD // Curated Supply Node",
  description: "High-end digital assets and intelligent data pipeline streams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${syncopate.variable} h-full dark`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <AuthSessionProvider>
          <Navbar />
          <main className="flex-1 w-full relative">
            {children}
          </main>
          <CookieBanner />
        </AuthSessionProvider>
      </body>
    </html>
  );
}