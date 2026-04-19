"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftStartOnRectangleIcon,
  InboxIcon,
  PresentationChartBarIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import type { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { LanguagePicker } from "./LanguagePicker";
import { NotificationModal } from "./NotificationModal";

export function Navbar({ session, locale }: { session: Session | null; locale: string }) {
  const t = useTranslations("layout");

  return (
    <div className="navbar bg-base-100 justify-between rounded-2xl shadow-xl">
      <Link href="/" className="btn btn-ghost text-xl">
        <Image src="/R.png" width={64} height={64} alt="RateMyRoommate" />
      </Link>

      {session?.user ? (
        <div className="flex items-center gap-6">
          <LanguagePicker currentLocale={locale} />
          <NotificationModal session={session} />
          <div className="dropdown dropdown-end mr-4 w-10 hover:cursor-pointer">
            <div role="button" tabIndex={0} className="avatar">
              <div className="ring-primary ring-offset-base-100 w-full rounded-full ring-3 ring-offset-2">
                {session.user.image ? (
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
            <div
              tabIndex={0}
              className="dropdown-content"
              onClick={() => (document.activeElement as HTMLElement)?.blur()}
            >
              <ul className="menu rounded-box bg-base-100 z-1 mt-2 w-52 p-2 shadow-sm">
                <li>
                  <Link href={`/users/${session.user.id}`}>
                    <UserCircleIcon width={20} />
                    {t("profile")}
                  </Link>
                </li>
                <li>
                  <Link href="/compatibility-kviz">
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
  );
}
