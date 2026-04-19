"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setLocale } from "~/app/actions/setLocale";
import { LOCALE_OPTIONS } from "~/i18n/locales";

export function LanguagePicker({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("layout");

  const current = LOCALE_OPTIONS.find((l) => l.code === currentLocale) ?? LOCALE_OPTIONS[0];

  function handleSelect(code: string) {
    if (code === currentLocale) return;
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
    startTransition(async () => {
      await setLocale(code);
      router.refresh();
    });
  }

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-sm gap-1.5"
        disabled={isPending}
        aria-label={t("selectLanguage")}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs font-semibold uppercase tracking-wide">
          {current.code}
        </span>
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box bg-base-100 z-10 mt-1 w-36 p-1 shadow-lg"
      >
        {LOCALE_OPTIONS.map((locale) => (
          <li key={locale.code}>
            <button
              onClick={() => handleSelect(locale.code)}
              className={locale.code === currentLocale ? "active" : ""}
            >
              <span>{locale.flag}</span>
              <span className="text-sm">{locale.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
