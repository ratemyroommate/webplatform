"use client";

import { Link } from "~/i18n/navigation";
import NextLink from "next/link";
import { Inbox, LogOut, BarChart3, UserCircle } from "lucide-react";
import type { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { LanguagePicker } from "./LanguagePicker";
import { NotificationModal } from "./NotificationModal";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function Navbar({ session, locale }: { session: Session | null; locale: string }) {
  const t = useTranslations("layout");

  return (
    <header className="bg-background/85 sticky top-0 z-40 w-full border-b border-[color:var(--ink-10)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {session?.user ? (
          <div className="flex items-center gap-2">
            <LanguagePicker currentLocale={locale} />
            <NotificationModal session={session} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ring-offset-background focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
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
                  <NextLink href="/api/auth/signout">
                    <LogOut />
                    {t("signOut")}
                  </NextLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <LanguagePicker currentLocale={locale} />
            <Button asChild variant="chunky" size="sm">
              <Link href="/signin">{t("login")}</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
