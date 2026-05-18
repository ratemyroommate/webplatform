"use client";

import { useLocale, useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { Link } from "~/i18n/navigation";
import Image from "next/image";

const FRESH_WINDOW_DAYS = 4;

export function FreshTodayStrip() {
  const t = useTranslations("post");
  const te = useTranslations("enums.location");
  const locale = useLocale();
  const { data } = api.post.getLatest.useInfiniteQuery(
    { filters: {} },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  const firstPage = data?.pages[0]?.posts ?? [];
  const cutoff = Date.now() - FRESH_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const fresh = firstPage.filter((p) => new Date(p.createdAt).getTime() > cutoff).slice(0, 8);

  if (!fresh.length) return null;

  const heading = locale === "hu" ? "Friss ma" : "Fresh today";

  return (
    <div className="-mx-6">
      <div className="mb-3 flex items-center justify-between gap-3 px-6">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
          </span>
          <h2 className="text-[14px] font-extrabold uppercase tracking-wider text-[var(--foreground)]">
            {heading}
          </h2>
          <span
            className="rounded-full px-2 py-0.5 text-[10.5px] font-bold tabular-nums"
            style={{ background: "var(--ink-05)", color: "var(--ink-70)" }}
          >
            {fresh.length}
          </span>
        </div>
      </div>
      <div
        className="fresh-scroll flex gap-3 overflow-x-auto px-6 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        <style>{`.fresh-scroll::-webkit-scrollbar{display:none}`}</style>
        {fresh.map((p) => {
          const cover = p.images[0]?.url;
          return (
            <Link
              key={p.id}
              href={`/posts/${p.id}`}
              className="group relative shrink-0 overflow-hidden rounded-2xl"
              style={{ width: 120, aspectRatio: "3 / 4", background: "var(--ink-05)" }}
            >
              {cover && (
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-2.5 text-left text-white">
                <div className="truncate text-[12px] font-bold">{te(p.location)}</div>
                <div className="text-[10.5px] tabular-nums opacity-90">
                  {p.price}k {t("priceShort")}
                </div>
              </div>
              <div
                className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                NEW
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
