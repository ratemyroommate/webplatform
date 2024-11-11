import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

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
            <div className="container flex max-w-4xl flex-col items-center justify-center gap-8 px-4 py-4">
              <div className="navbar bg-base-100 justify-between rounded-2xl shadow-xl">
                <Link href="/" className="btn btn-ghost text-xl">
                  RmRm
                </Link>

                <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
                  {session?.user ? (
                    <div className="avatar mr-4 w-10">
                      <div className="ring-primary ring-offset-base-100 rounded-full ring ring-offset-2">
                        <img src={session?.user.image ?? ""} />
                      </div>
                    </div>
                  ) : (
                    <div className="btn">Login</div>
                  )}
                </Link>
              </div>
              {children}
            </div>
          </main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
