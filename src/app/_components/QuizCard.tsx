"use client";

import { ArrowRight, CheckCheck, Puzzle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { api } from "~/trpc/react";

export const QuizCard = () => {
  const { data } = api.user.getProfileCompleteness.useQuery();
  const t = useTranslations("profile.quizCard");

  if (!data) return null;

  const { kvizAnswered, kvizTotal } = data;
  const done = kvizTotal > 0 && kvizAnswered >= kvizTotal;

  return (
    <Link
      href="/compatibility-kviz"
      className="block rounded-3xl p-6 text-[var(--background)] transition-transform hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(160deg, var(--foreground) 0%, var(--ink-80) 100%)",
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className="inline-flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <Puzzle size={14} strokeWidth={2} />
        </span>
        <span
          className="text-[12px] font-semibold uppercase tracking-[0.12em]"
          style={{ opacity: 0.8 }}
        >
          {t("overline")}
        </span>
      </div>
      <h3
        className="leading-[1.05] tracking-[-0.02em]"
        style={{ fontSize: 30, fontWeight: 800 }}
      >
        {done ? t("titleDone") : t("titleInProgress")}
      </h3>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div
          className="flex min-w-0 items-center gap-2 text-[12.5px]"
          style={{ opacity: 0.85 }}
        >
          {done ? (
            <CheckCheck size={14} strokeWidth={2} style={{ color: "var(--accent-green-hex)" }} />
          ) : null}
          <span className="truncate">
            {t("progress", { answered: kvizAnswered, total: kvizTotal })}
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white/15 px-4 py-2 text-[12.5px] font-bold backdrop-blur-md hover:bg-white/25">
          {done ? t("review") : t("continue")}
          <ArrowRight size={13} strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  );
};
