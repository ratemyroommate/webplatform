"use client";

import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { Link } from "~/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("error");

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-primary text-6xl font-extrabold">404</p>
      <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
        {t("notFoundTitle")}
      </h1>
      <p className="max-w-md text-[color:var(--ink-70)]">{t("notFoundDescription")}</p>
      <Button asChild variant="chunky" className="mt-2">
        <Link href="/">{t("home")}</Link>
      </Button>
    </main>
  );
}
