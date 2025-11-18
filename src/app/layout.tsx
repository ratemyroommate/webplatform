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

export const metadata: Metadata = {
  title: "Rate My Roommate",
  description: "A hely ahol megtalálod a helyed",
  icons: [{ rel: "icon", url: "/R-favicon.png" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
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
                    <NotificationModal session={session} />
                    <div className="dropdown dropdown-end mr-4 w-10">
                      <div role="button" tabIndex={0} className="avatar">
                        <div className="ring-primary ring-offset-base-100 w-full rounded-full ring-3 ring-offset-2">
                          {session?.user.image ? (
                            <Image
                              width={30}
                              height={30}
                              src={session.user.image}
                              alt="profile picture"
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
                              Profil
                            </Link>
                          </li>
                          <li>
                            <Link href={`/compatibility-kviz`}>
                              <PresentationChartBarIcon width={20} />
                              Kvíz
                            </Link>
                          </li>
                          <li>
                            <Link href={`/users/${session.user.id}/posts`}>
                              <InboxIcon width={20} />
                              Posztjaim
                            </Link>
                          </li>
                          <li>
                            <Link href="/api/auth/signout">
                              <ArrowLeftStartOnRectangleIcon width={20} />
                              Kijelentkezés
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/api/auth/signin" className="btn">
                    Login
                  </Link>
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
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="link">
                  Privacy Policy
                </Link>
              </li>
            </ul>
            <span className="text-base-300">© 2025 Ratemyroommate</span>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
