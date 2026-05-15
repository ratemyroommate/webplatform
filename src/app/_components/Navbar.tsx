"use client";

import Link from "next/link";
import Image from "next/image";
import { Inbox, LogOut, BarChart3, UserCircle } from "lucide-react";
import type { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { LanguagePicker } from "./LanguagePicker";
import { NotificationModal } from "./NotificationModal";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function Navbar({ session, locale }: { session: Session | null; locale: string }) {
  const t = useTranslations("layout");

  return (
    <header className="bg-card flex w-full items-center justify-between rounded-2xl border px-4 py-2 shadow-sm">
      <Link href="/" className="flex items-center">
        <Image src="/R.png" width={64} height={64} alt="RateMyRoommate" />
      </Link>

      {session?.user ? (
        <div className="flex items-center gap-4">
          <LanguagePicker currentLocale={locale} />
          <NotificationModal session={session} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ring-primary ring-offset-background rounded-full ring-2 ring-offset-2 outline-none">
                <Avatar className="size-9">
                  {session.user.image && (
                    <AvatarImage src={session.user.image} alt={t("profilePicture")} />
                  )}
                  <AvatarFallback>
                    {session.user.name?.charAt(0).toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href={`/users/${session.user.id}`}>
                  <UserCircle />
                  {t("profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/compatibility-kviz">
                  <BarChart3 />
                  {t("quiz")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/users/${session.user.id}/posts`}>
                  <Inbox />
                  {t("myPosts")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/api/auth/signout">
                  <LogOut />
                  {t("signOut")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <LanguagePicker currentLocale={locale} />
          <Button asChild>
            <Link href="/api/auth/signin">{t("login")}</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
