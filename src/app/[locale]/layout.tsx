import "~/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
import { type Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { TRPCReactProvider } from "~/trpc/react";
import { getServerAuthSession } from "~/server/auth";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";
import { KvizToast } from "~/app/_components/KvizToast";
import { Navbar } from "~/app/_components/Navbar";
import { LoginModalProvider } from "~/app/_components/LoginModal";
import { JsonLd } from "~/app/_components/JsonLd";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { env } from "~/env";
import { routing } from "~/i18n/routing";
import { Link } from "~/i18n/navigation";
import { SUPPORTED_LOCALES } from "~/i18n/locales";

type LayoutProps = {
  children: React.ReactNode;
  params: { locale: string };
};

const baseUrl = env.NEXTAUTH_URL.startsWith("http")
  ? env.NEXTAUTH_URL
  : `https://${env.NEXTAUTH_URL}`;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

function pathForLocale(locale: string, path: string) {
  return locale === routing.defaultLocale ? path : `/${locale}${path === "/" ? "" : path}`;
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const description = tMeta("home.description");
  const siteName = tMeta("siteName");

  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `${baseUrl}${pathForLocale(l, "/")}`])
  );

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    alternates: {
      canonical: pathForLocale(locale, "/"),
      languages: { ...languages, "x-default": `${baseUrl}/` },
    },
    icons: [{ rel: "icon", url: "/R-favicon.png" }],
    openGraph: {
      type: "website",
      siteName,
      title: siteName,
      description,
      locale: locale === "hu" ? "hu_HU" : "en_US",
      url: pathForLocale(locale, "/"),
      images: [{ url: "/R.png", width: 512, height: 512, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: ["/R.png"],
    },
  };
}

export default async function RootLayout({ children, params: { locale } }: LayoutProps) {
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await getServerAuthSession();
  const messages = await getMessages();
  const t = await getTranslations("layout");
  const tMeta = await getTranslations("metadata");
  const siteName = tMeta("siteName");

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: baseUrl,
    inLanguage: locale,
  };
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: baseUrl,
    logo: `${baseUrl}/R.png`,
    email: "rmrm.owners@gmail.com",
  };

  return (
    <html lang={locale} className={plusJakarta.variable}>
      <body>
        <JsonLd data={[websiteLd, organizationLd]} />
        <TRPCReactProvider>
          <NextIntlClientProvider messages={messages}>
            <TooltipProvider>
              <LoginModalProvider>
                <Toaster richColors position="top-center" />
                <KvizToast session={session} />
                <main className="bg-background flex min-h-screen flex-col">
                  <Navbar session={session} locale={locale} />
                  <div className="mx-auto flex w-full max-w-[1240px] flex-col items-stretch gap-4 px-6 py-6">
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
