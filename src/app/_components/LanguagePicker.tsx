"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "~/i18n/navigation";
import { SUPPORTED_LOCALES, type Locale } from "~/i18n/locales";
import { Button } from "~/components/ui/button";

export function LanguagePicker({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("layout");

  const currentIndex = Math.max(0, SUPPORTED_LOCALES.indexOf(currentLocale as Locale));
  const nextLocale = SUPPORTED_LOCALES[(currentIndex + 1) % SUPPORTED_LOCALES.length]!;

  function handleClick() {
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- next-intl typed routes are strict; we pass dynamic params verbatim
        { pathname, params },
        { locale: nextLocale }
      );
    });
  }

  return (
    <Button
      type="button"
      variant="flat"
      size="pill"
      onClick={handleClick}
      disabled={isPending}
      aria-label={t("selectLanguage")}
      title={nextLocale.toUpperCase()}
    >
      <Globe size={13} strokeWidth={2} />
      <span className="tracking-wide uppercase">{currentLocale}</span>
    </Button>
  );
}
