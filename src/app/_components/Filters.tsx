"use client";

import {
  Filter,
  SlidersHorizontal,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { z } from "zod";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { orderBy } from "~/server/api/routers/post";
import { FiltersIndicator } from "./FiltersIndicator";
import type { Dispatch } from "react";
import { ageOptions, locationOptions } from "~/utils/helpers";
import type { Location } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Slider } from "~/components/ui/slider";
import { cn } from "~/lib/utils";

type FiltersProps = { filters: FormValues; setFilters: Dispatch<FormValues> };
export type FormValues = {
  maxPersonCount?: number;
  maxPrice?: number;
  location?: Location | "";
  age?: number;
  gender?: number;
  orderBy?: OrderBy;
};
export type OrderBy = z.infer<typeof orderBy>;

const defaultFilters: FormValues = {
  orderBy: "createdAt-desc",
  maxPersonCount: 0,
  maxPrice: 0,
  location: "",
  age: 0,
  gender: 0,
};

const ANY_LOCATION = "__any__";

export const Filters = ({ filters, setFilters }: FiltersProps) => {
  const t = useTranslations("filter");
  const te = useTranslations("enums");
  const [open, setOpen] = useState(false);
  const { reset, control, handleSubmit, watch, setValue } = useForm<FormValues>({
    defaultValues: Object.keys(filters).length ? filters : defaultFilters,
  });

  const onSubmit = (formValues: FormValues) => {
    setOpen(false);
    setFilters(formValues);
  };

  const resetFilters = () => {
    setOpen(false);
    setFilters({});
    reset();
  };

  return (
    <>
      <FiltersIndicator filters={filters}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          className="bg-card shadow-sm"
        >
          <SlidersHorizontal />
        </Button>
      </FiltersIndicator>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="bg-background flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[420px]"
        >
          <SheetHeader className="border-b border-[color:var(--ink-10)] px-5 py-4">
            <SheetTitle className="text-foreground text-[17px] font-extrabold tracking-[-0.01em]">
              {t("title")}
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5">
              {/* Roommates */}
              <Field label={t("roommates")}>
                <Controller
                  control={control}
                  name="maxPersonCount"
                  render={({ field }) => (
                    <Segmented
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      options={[2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))}
                      columns={4}
                    />
                  )}
                />
              </Field>

              {/* Max price */}
              <div>
                <div className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-[12px] font-medium tracking-[0.1em] text-[color:var(--ink-60)] uppercase">
                    {t("maxPrice")}
                  </span>
                  <span className="text-foreground text-[14px] font-semibold tabular-nums">
                    {watch("maxPrice") ?? 0}{" "}
                    <span className="text-[11px] font-normal text-[color:var(--ink-60)]">
                      {t("maxPriceUnit")}
                    </span>
                  </span>
                </div>
                <Slider
                  min={50}
                  max={300}
                  step={5}
                  value={[watch("maxPrice") ?? 50]}
                  onValueChange={(v) => setValue("maxPrice", v[0])}
                />
                <div className="mt-1.5 flex justify-between text-[10.5px] text-[color:var(--ink-50)] tabular-nums">
                  <span>50</span>
                  <span>100</span>
                  <span>150</span>
                  <span>200</span>
                  <span>250</span>
                  <span>300</span>
                </div>
              </div>

              {/* Location */}
              <Field label={t("location")}>
                <Controller
                  control={control}
                  name="location"
                  render={({ field }) => (
                    <Select
                      value={field.value ? field.value : ANY_LOCATION}
                      onValueChange={(v) => field.onChange(v === ANY_LOCATION ? "" : v)}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl">
                        <SelectValue placeholder={t("locationPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ANY_LOCATION}>{t("anyLocation")}</SelectItem>
                        {locationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {te(`location.${opt.value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* Age */}
              <Field label={t("ageLabel")}>
                <Controller
                  control={control}
                  name="age"
                  render={({ field }) => (
                    <Select
                      value={String(field.value ?? 0)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl">
                        <SelectValue placeholder={t("agePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {ageOptions.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {te(`age.${opt.value}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              {/* Gender preference */}
              <Field label={t("genderPreference")}>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Segmented
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      columns={3}
                      options={[
                        { value: 0, label: te("gender.0"), icon: <Users size={13} /> },
                        { value: 1, label: te("gender.1"), icon: <User size={13} /> },
                        { value: 2, label: te("gender.2"), icon: <User size={13} /> },
                      ]}
                    />
                  )}
                />
              </Field>

              {/* Sort */}
              <Field label={t("sort")}>
                <Controller
                  control={control}
                  name="orderBy"
                  render={({ field }) => (
                    <Segmented<OrderBy>
                      value={field.value ?? "createdAt-desc"}
                      onChange={field.onChange}
                      columns={2}
                      options={[
                        {
                          value: "price-asc",
                          label: t("price"),
                          icon: (
                            <TrendingUp
                              size={13}
                              className="text-[color:var(--accent-green-hex)]"
                            />
                          ),
                        },
                        {
                          value: "price-desc",
                          label: t("price"),
                          icon: <TrendingDown size={13} className="text-destructive" />,
                        },
                        {
                          value: "createdAt-asc",
                          label: t("date"),
                          icon: (
                            <TrendingUp
                              size={13}
                              className="text-[color:var(--accent-green-hex)]"
                            />
                          ),
                        },
                        {
                          value: "createdAt-desc",
                          label: t("date"),
                          icon: <TrendingDown size={13} className="text-destructive" />,
                        },
                      ]}
                    />
                  )}
                />
              </Field>
            </div>

            {/* Sticky footer */}
            <div className="bg-background flex gap-2 border-t border-[color:var(--ink-10)] px-5 py-4">
              <Button type="button" variant="outline" onClick={resetFilters} className="flex-1">
                <Trash2 /> {t("reset")}
              </Button>
              <Button type="submit" className="flex-1">
                <Filter /> {t("apply")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2.5 block text-[12px] font-medium tracking-[0.1em] text-[color:var(--ink-60)] uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

type SegmentedOption<V> = {
  value: V;
  label: string;
  icon?: React.ReactNode;
};

function Segmented<V extends string | number>({
  value,
  onChange,
  options,
  columns,
}: {
  value: V;
  onChange: (v: V) => void;
  options: SegmentedOption<V>[];
  columns: 2 | 3 | 4;
}) {
  const grid = columns === 4 ? "grid-cols-4" : columns === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div className={cn("grid gap-2", grid)}>
      {options.map((o) => {
        const isActive = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-xl border px-2 py-1.5 text-[13px] font-medium transition-all",
              isActive
                ? "border-[color:var(--foreground)] bg-[var(--foreground)] text-[color:var(--background)]"
                : "border-[color:var(--ink-15)] bg-[var(--card)] text-[color:var(--ink-80)] hover:border-[color:var(--ink-40)]"
            )}
          >
            {o.icon && <span className="shrink-0">{o.icon}</span>}
            <span className="line-clamp-2 text-center leading-tight break-words">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
