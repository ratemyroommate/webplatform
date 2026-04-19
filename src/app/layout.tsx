import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { NotificationModal } from "./_components/NotificationModal";
import {
  ArrowLeftStartOnRectangleIcon,
  InboxIcon,
  PresentationChartBarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { KvizToast } from "./_components/KvizToast";
import { LanguagePicker } from "./_components/LanguagePicker";
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
            <Toaster />
            <KvizToast session={session} />
            <main className="bg-base-200 flex min-h-screen flex-col items-center">
              <div className="container flex max-w-4xl flex-col items-center justify-center gap-4 px-4 py-4">
                <div className="navbar bg-base-100 justify-between rounded-2xl shadow-xl">
                  <Link href="/" className="btn btn-ghost text-xl">
                    <img src="/R.png" className="w-16" />
                  </Link>

                  {session?.user ? (
                    <div className="flex items-center gap-6">
                      <LanguagePicker currentLocale={locale} />
                      <NotificationModal session={session} />
                      <div className="dropdown dropdown-end mr-4 w-10 hover:cursor-pointer">
                        <div role="button" tabIndex={0} className="avatar">
                          <div className="ring-primary ring-offset-base-100 w-full rounded-full ring-3 ring-offset-2">
                            {session?.user.image ? (
                              <Image
                                width={30}
                                height={30}
                                src={session.user.image}
                                alt={t("profilePicture")}
                                loading="eager"
                              />
                            ) : (
                              <div className="skeleton h-full w-full rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <div tabIndex={0} className="dropdown-content">
                          <ul className="menu rounded-box bg-base-100 z-1 mt-2 w-52 p-2 shadow-sm">
                            <li>
                              <Link href={`/users/${session.user.id}`}>
                                <UserCircleIcon width={20} />
                                {t("profile")}
                              </Link>
                            </li>
                            <li>
                              <Link href={`/compatibility-kviz`}>
                                <PresentationChartBarIcon width={20} />
                                {t("quiz")}
                              </Link>
                            </li>
                            <li>
                              <Link href={`/users/${session.user.id}/posts`}>
                                <InboxIcon width={20} />
                                {t("myPosts")}
                              </Link>
                            </li>
                            <li>
                              <Link href="/api/auth/signout">
                                <ArrowLeftStartOnRectangleIcon width={20} />
                                {t("signOut")}
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mr-2">
                      <LanguagePicker currentLocale={locale} />
                      <Link href="/api/auth/signin" className="btn">
                        {t("login")}
                      </Link>
                    </div>
                  )}
                </div>
                {children}
              </div>
            </main>
            <div className="bg-neutral text-base-300 flex h-48 flex-col items-center justify-center">
              <img src="/R-white.png" className="w-16" />
              <ul className="flex flex-col items-center">
                <li>
                  <Link href="/contact" className="link">
                    {t("contact")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="link">
                    {t("privacyPolicy")}
                  </Link>
                </li>
              </ul>
              <span className="text-base-300">{t("copyright")}</span>
            </div>
          </NextIntlClientProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
