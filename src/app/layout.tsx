import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { KeyboardNavigation } from "@/components/keyboard-navigation";
import { ScreenReaderSupport } from "@/components/screen-reader-support";
import { UserProvider } from "@/contexts/user-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TileManager Pro - Complete Business Management Solution",
  description: "Comprehensive tile business management system with inventory, billing, customer management, and advanced analytics.",
  keywords: "tile business, inventory management, billing system, customer management, business analytics",
  authors: [{ name: "TileManager Pro Team" }],
  creator: "TileManager Pro",
  publisher: "TileManager Pro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tilemanager.pro"),
  openGraph: {
    title: "TileManager Pro - Complete Business Management Solution",
    description: "Comprehensive tile business management system with inventory, billing, customer management, and advanced analytics.",
    url: "https://tilemanager.pro",
    siteName: "TileManager Pro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TileManager Pro Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TileManager Pro - Complete Business Management Solution",
    description: "Comprehensive tile business management system with inventory, billing, customer management, and advanced analytics.",
    images: ["/og-image.png"],
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TileManager Pro" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Accessibility Meta Tags */}
        <meta name="application-name" content="TileManager Pro" />
        <meta name="msapplication-tooltip" content="TileManager Pro Business Management" />
        <meta name="msapplication-starturl" content="/" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "TileManager Pro",
              "description": "Comprehensive tile business management system",
              "url": "https://tilemanager.pro",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "TileManager Pro Team"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <UserProvider>
            {/* Accessibility Components */}
            <KeyboardNavigation />
            <ScreenReaderSupport />
            
            {/* Main Content */}
            <main id="main-content" role="main">
              {children}
            </main>
            
            {/* Toast Notifications */}
            <Toaster />
          </UserProvider>
      </body>
    </html>
  );
}
