"use client";

import { Link } from "~/i18n/navigation";
import type { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { LanguagePicker } from "./LanguagePicker";
import { NotificationModal } from "./NotificationModal";
import { ProfileDropdown } from "./ProfileDropdown";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/ui/logo";

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
            <ProfileDropdown user={session.user} />
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
