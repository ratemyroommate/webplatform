"use client";

import { useTranslations } from "next-intl";

import { Button } from "~/components/ui/button";
import { Link } from "~/i18n/navigation";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-foreground text-3xl font-extrabold tracking-tight">{t("title")}</h1>
      <p className="max-w-md text-[color:var(--ink-70)]">{t("description")}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button variant="chunky" onClick={() => reset()}>
          {t("retry")}
        </Button>
        <Button asChild variant="flat">
          <Link href="/">{t("home")}</Link>
        </Button>
      </div>
    </main>
  );
}
