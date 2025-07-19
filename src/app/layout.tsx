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
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Rate My Roommate",
  description: "A hely ahol megtalálod a helyed",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
          <main className="bg-base-200 flex min-h-screen flex-col items-center">
            <div className="container flex max-w-4xl flex-col items-center justify-center gap-4 px-4 py-4">
              <div className="navbar bg-base-100 justify-between rounded-2xl shadow-xl">
                <Link href="/" className="btn btn-ghost text-xl">
                  RmRm
                </Link>

                {session?.user ? (
                  <div className="flex items-center gap-6">
                    <NotificationModal />
                    <div
                      className="avatar dropdown dropdown-end mr-4 w-10"
                      tabIndex={0}
                      role="button"
                    >
                      <div className="ring-primary ring-offset-base-100 w-full rounded-full ring-3 ring-offset-2">
                        {session?.user.image ? (
                          <img src={session.user.image} alt="profile picture" />
                        ) : (
                          <div className="skeleton h-full w-full rounded-full"></div>
                        )}
                      </div>
                      <ul
                        tabIndex={0}
                        className="menu dropdown-content rounded-box bg-base-100 z-1 w-52 p-2 shadow-sm"
                      >
                        <li>
                          <Link
                            href={`/users/${session.user.id}`}
                            className="btn"
                          >
                            <UserCircleIcon width={20} />
                            Profil
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={`/users/${session.user.id}/posts`}
                            className="btn btn-ghost"
                          >
                            <InboxIcon width={20} />
                            Posztjaim
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/api/auth/signout"
                            className="btn btn-ghost"
                          >
                            <ArrowLeftStartOnRectangleIcon width={20} />
                            Kijelentkezés
                          </Link>
                        </li>
                      </ul>
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
        </TRPCReactProvider>
      </body>
    </html>
  );
}
