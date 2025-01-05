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
          <main className="flex min-h-screen flex-col items-center bg-base-200">
            <div className="container flex max-w-4xl flex-col items-center justify-center gap-4 px-4 py-4">
              <div className="navbar justify-between rounded-2xl bg-base-100 shadow-xl">
                <Link href="/" className="btn btn-ghost text-xl">
                  RmRm
                </Link>

                {session?.user ? (
                  <div className="gap-6">
                    <NotificationModal />
                    <div
                      className="avatar dropdown dropdown-end mr-4 w-10"
                      tabIndex={0}
                      role="button"
                    >
                      <div className="rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                        <img src={session?.user.image ?? ""} />
                      </div>
                      <ul
                        tabIndex={0}
                        className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow"
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
