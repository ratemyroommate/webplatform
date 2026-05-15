"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setLocale } from "~/app/actions/setLocale";
import { LOCALE_OPTIONS } from "~/i18n/locales";
import { Button } from "~/components/ui/button";
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
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          disabled={isPending}
          aria-label={t("selectLanguage")}
        >
          <span className="text-base leading-none">{current.flag}</span>
          <span className="text-xs font-semibold tracking-wide uppercase">{current.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {LOCALE_OPTIONS.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => handleSelect(locale.code)}
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
