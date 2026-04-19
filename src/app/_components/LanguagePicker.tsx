"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "~/app/actions/setLocale";

const LOCALES = [
  { code: "hu", flag: "🇭🇺", label: "Magyar" },
  { code: "en", flag: "🇬🇧", label: "English" },
] as const;

export function LanguagePicker({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  function handleSelect(code: string) {
    if (code === currentLocale) return;
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
        aria-label="Select language"
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
        {LOCALES.map((locale) => (
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
