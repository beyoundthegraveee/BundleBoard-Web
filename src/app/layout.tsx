import { Space_Grotesk, Syncopate } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/provider/SessionProvider";
import { ThemeProvider } from "@/components/provider/ThemeProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { Navbar } from "@/components/Navbar";
import { SplashProvider } from "@/components/SplashProvider";

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

export const metadata = {
  title: "BundleBoard",
  description: "Production-grade asset platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${syncopate.variable} h-full`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans antialiased">
        <AuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <SplashProvider>
              <Navbar />
              <main className="flex-1 w-full relative">
                {children}
              </main>
              <CookieBanner />
            </SplashProvider>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}