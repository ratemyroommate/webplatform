"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "~/i18n/navigation";
import { SUPPORTED_LOCALES, type Locale } from "~/i18n/locales";

export function LanguagePicker({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("layout");

  const currentIndex = Math.max(
    0,
    SUPPORTED_LOCALES.indexOf(currentLocale as Locale)
  );
  const nextLocale = SUPPORTED_LOCALES[(currentIndex + 1) % SUPPORTED_LOCALES.length] as Locale;

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
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={t("selectLanguage")}
      title={nextLocale.toUpperCase()}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[color:var(--ink-10)] bg-[var(--card)] px-3 text-[12px] font-medium text-[color:var(--ink-70)] transition-colors outline-none hover:border-[color:var(--ink-30)] hover:text-[color:var(--foreground)] disabled:opacity-50"
    >
      <Globe size={13} strokeWidth={2} />
      <span className="tracking-wide uppercase">{currentLocale}</span>
    </button>
  );
}
