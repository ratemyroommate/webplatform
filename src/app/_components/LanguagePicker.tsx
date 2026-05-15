"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setLocale } from "~/app/actions/setLocale";
import { LOCALE_OPTIONS } from "~/i18n/locales";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function LanguagePicker({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("layout");

  const current = LOCALE_OPTIONS.find((l) => l.code === currentLocale) ?? LOCALE_OPTIONS[0];

  function handleSelect(code: string) {
    if (code === currentLocale) return;
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        aria-label={t("selectLanguage")}
        className="hover:bg-accent inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors outline-none disabled:opacity-50"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs font-semibold tracking-wide uppercase">{current.code}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {LOCALE_OPTIONS.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onSelect={() => handleSelect(locale.code)}
            className={locale.code === currentLocale ? "font-semibold" : ""}
          >
            <span>{locale.flag}</span>
            <span className="text-sm">{locale.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
