import "./globals.css";
import Navbar from "@/app/Components/Navbar";
import Footer from "@/app/Components/Footer";
import Providers from "./providers";
import SWRProvider from "./swr-provider";
import { ClerkProvider } from "@clerk/nextjs";
import InitLikesMigration from "@/app/Components/InitLikesMigration";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/favicon/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/favicon/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/favicon/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/favicon/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/favicon/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/favicon/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/favicon/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/favicon/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicon/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta
          name="msapplication-TileImage"
          content="/favicon/ms-icon-144x144.png"
        />
        <meta name="theme-color" content="#F0D586" />
      </head>
      <body className="bg-background text-foreground font-noto-nastaliq">
        <ClerkProvider>
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? null : (
            <div className="w-full bg-yellow-700/30 text-yellow-200 text-sm text-center py-1">
              Clerk publishable key missing. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local (dev only banner).
            </div>
          )}
          {/* Migrate legacy localStorage likes to Clerk metadata immediately after sign-in */}
          <InitLikesMigration />
          <Providers>
            <SWRProvider>
              <div className="app-root min-h-screen flex flex-col">
                <header className="w-full flex items-center justify-between gap-4">
                  <Navbar />
                </header>
                <main className="flex-1 mt-[96px] lg:mt-[60px]">{children}</main>
                <Footer />
              </div>
            </SWRProvider>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
