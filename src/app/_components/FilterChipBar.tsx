"use client";

import { Building2, Flame, MapPin, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Location } from "@prisma/client";

type FilterChipBarProps = {
  active: Location | "all";
  onChange: (loc: Location | "all") => void;
};

const chips: Array<{
  key: Location | "all";
  icon: typeof Sparkles;
  labelKey: string;
}> = [
  { key: "all", icon: Sparkles, labelKey: "anyLocation" },
  { key: "BUDAPEST" as Location, icon: MapPin, labelKey: "BUDAPEST" },
  { key: "DEBRECEN" as Location, icon: Building2, labelKey: "DEBRECEN" },
  { key: "SZEGED" as Location, icon: Flame, labelKey: "SZEGED" },
];

export function FilterChipBar({ active, onChange }: FilterChipBarProps) {
  const te = useTranslations("enums.location");
  const tf = useTranslations("filter");

  return (
    <div className="chip-scroll flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      <style>{`.chip-scroll::-webkit-scrollbar{display:none}`}</style>
      {chips.map((c) => {
        const isActive = active === c.key;
        const Icon = c.icon;
        const label = c.key === "all" ? tf("anyLocation") : te(c.labelKey);
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onChange(c.key)}
            className={
              "relative flex shrink-0 flex-col items-center gap-1 whitespace-nowrap px-4 pb-3 pt-1 text-[11.5px] font-bold transition-colors " +
              (isActive
                ? "text-[var(--foreground)]"
                : "text-[color:var(--ink-50)] hover:text-[color:var(--ink-80)]")
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            <span>{label}</span>
            {isActive && (
              <span
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full"
                style={{ background: "var(--foreground)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
