"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { PostModal } from "./PostModal";
import { Filters } from "./Filters";
import { FeedPosts } from "./FeedPosts";
import { FilterChipBar } from "./FilterChipBar";
import { FreshTodayStrip } from "./FreshTodayStrip";
import { CtaBanner } from "~/components/ui/cta-banner";
import type { Location } from "@prisma/client";
import type { FormValues } from "./Filters";

type FeedProps = { userId?: string };

export const Feed = ({ userId }: FeedProps) => {
  const [filters, setFilters] = useState<FormValues>({});
  const t = useTranslations("post");

  const activeLocation = useMemo<Location | "all">(
    () => (filters.location ? filters.location : "all"),
    [filters.location]
  );

  const setLocation = (loc: Location | "all") => {
    setFilters({ ...filters, location: loc === "all" ? "" : loc });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <FreshTodayStrip />

      <div className="bg-background/95 sticky top-[60px] z-20 -mx-6 flex items-center gap-2 border-b border-[color:var(--ink-10)] px-6 pt-2 backdrop-blur">
        <div className="min-w-0 flex-1">
          <FilterChipBar active={activeLocation} onChange={setLocation} />
        </div>
        <div className="pb-2">
          <Filters filters={filters} setFilters={setFilters} />
        </div>
      </div>

      <PostModal
        userId={userId}
        renderTrigger={(open) => (
          <CtaBanner
            title={t("newPost")}
            subtitle={t("rentTooltip")}
            icon={Plus}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            onClick={open}
          />
        )}
      />

      <FeedPosts filters={filters} />
    </div>
  );
};
