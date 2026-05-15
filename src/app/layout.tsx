import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { TRPCReactProvider } from "~/trpc/react";
import { getServerAuthSession } from "~/server/auth";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { KvizToast } from "./_components/KvizToast";
import { Navbar } from "./_components/Navbar";
import { LoginModalProvider } from "./_components/LoginModal";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const description = t("home.description");
  const siteName = t("siteName");

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    icons: [{ rel: "icon", url: "/R-favicon.png" }],
    openGraph: {
      type: "website",
      siteName,
      title: siteName,
      description,
      locale: "hu_HU",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("layout");

  return (
    <html lang={locale} className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <NextIntlClientProvider messages={messages}>
            <TooltipProvider>
              <LoginModalProvider>
                <Toaster richColors position="top-center" />
                <KvizToast session={session} />
                <main className="bg-muted flex min-h-screen flex-col items-center">
                  <div className="container flex max-w-4xl flex-col items-center justify-center gap-4 px-4 py-4">
                    <Navbar session={session} locale={locale} />
                    {children}
                  </div>
                </main>
                <footer className="bg-foreground text-background flex h-48 flex-col items-center justify-center gap-2">
                  <Image src="/R-white.png" width={64} height={64} alt="RateMyRoommate" />
                  <nav className="flex flex-col items-center gap-1 text-sm">
                    <Link href="/contact" className="hover:underline">
                      {t("contact")}
                    </Link>
                    <Link href="/privacy-policy" className="hover:underline">
                      {t("privacyPolicy")}
                    </Link>
                  </nav>
                  <span className="text-xs opacity-70">{t("copyright")}</span>
                </footer>
              </LoginModalProvider>
            </TooltipProvider>
          </NextIntlClientProvider>
        </TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  );
}
