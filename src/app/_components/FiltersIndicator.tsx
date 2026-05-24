import { defaultFilters, type FormValues } from "./Filters";

type FiltersIndicatorProps = {
  children: React.ReactNode;
  filters: FormValues;
};

// Keys that contribute to the badge. `location` is excluded — it has its own
// surface in the chip bar above the feed, so it shouldn't double-count here.
const COUNTED_KEYS = ["maxPersonCount", "maxPrice", "age", "gender", "orderBy"] as const;

export function countActiveFilters(filters: FormValues): number {
  return COUNTED_KEYS.reduce((count, key) => {
    const value = filters[key];
    if (value === undefined) return count;
    return value !== defaultFilters[key] ? count + 1 : count;
  }, 0);
}

export const FiltersIndicator = ({ children, filters }: FiltersIndicatorProps) => {
  const hasActive = countActiveFilters(filters) > 0;

  return (
    <div className="relative inline-flex">
      {children}
      {hasActive && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--primary)]"
          style={{ boxShadow: "0 0 0 2px var(--background)" }}
        />
      )}
    </div>
  );
};
