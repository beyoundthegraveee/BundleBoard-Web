import { Space_Grotesk, Syncopate } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/provider/SessionProvider";
import { ThemeProvider } from "@/components/provider/ThemeProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { Navbar } from "@/components/Navbar";
import { SplashProvider } from "@/components/SplashProvider";
import { ApolloWrapper } from "@/lib/apolloWrapper";
import { Toaster } from "sonner";
import type { Metadata } from "next";

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
  metadataBase: new URL("https://bundleboard.com"),
  title: {
    default: "BundleBoard | High-Fidelity Digital Assets",
    template: "%s | BundleBoard",
  },
  description: "Unlock high-fidelity digital assets, custom vector graphs, and production-grade gradients optimized to enhance professional studio processing pipelines.",
  keywords: ["digital assets", "vector graphs", "design resources", "gradients", "ui kits", "bundleboard"],
  
  authors: [
    { 
      name: "Beyondheaven", 
      url: "https://github.com/beyoundthegraveee" 
    }
  ],
  creator: "Beyondheaven",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bundleboard.com",
    title: "BundleBoard | Intelligent Data & Curated Supply",
    description: "High-fidelity digital assets for professional studio processing pipelines.",
    siteName: "BundleBoard",
    images: [
      {
        url: "/public/og_image.jpg",
        width: 1200,
        height: 630,
        alt: "BundleBoard Platform Preview",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "BundleBoard | Digital Assets",
    description: "High-fidelity digital assets and production-grade gradients.",
    images: ["/og-image.jpg"],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
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
          <ApolloWrapper>
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
          </ApolloWrapper>
        </AuthSessionProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}