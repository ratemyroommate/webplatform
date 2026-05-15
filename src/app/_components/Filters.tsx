"use client";

import { SlidersHorizontal, TrendingDown, TrendingUp, Filter, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { z } from "zod";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { orderBy } from "~/server/api/routers/post";
import { FiltersIndicator } from "./FiltersIndicator";
import type { Dispatch } from "react";
import { ageOptions, genderOptions, locationOptions } from "~/utils/helpers";
import type { Location } from "@prisma/client";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Slider } from "~/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

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
        <SheetContent side="right" className="w-full overflow-y-auto p-4 sm:max-w-md">
          <SheetHeader className="p-0">
            <SheetTitle>{t("title")}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pt-4">
            <div className="flex flex-col gap-2">
              <Label>{t("roommates")}</Label>
              <Controller
                control={control}
                name="maxPersonCount"
                render={({ field }) => (
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(v) => field.onChange(v ? Number(v) : 0)}
                    className="w-full"
                  >
                    {Array.from({ length: 4 }, (_, i) => i + 2).map((n) => (
                      <ToggleGroupItem key={n} value={String(n)} className="flex-1">
                        {n}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>
                {t("maxPrice")}{" "}
                <span className="text-muted-foreground text-sm">
                  ( {watch("maxPrice")}
                  {t("maxPriceUnit")} )
                </span>
              </Label>
              <Slider
                min={50}
                max={500}
                step={10}
                value={[watch("maxPrice") ?? 50]}
                onValueChange={(v) => setValue("maxPrice", v[0])}
              />
              <div className="text-muted-foreground flex w-full justify-between px-1 text-xs">
                {Array.from({ length: 10 }, (_, i) => i * 50 + 50).map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("location")}</Label>
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <Select
                    value={field.value ? field.value : ANY_LOCATION}
                    onValueChange={(v) => field.onChange(v === ANY_LOCATION ? "" : v)}
                  >
                    <SelectTrigger className="w-full">
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
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("ageLabel")}</Label>
              <Controller
                control={control}
                name="age"
                render={({ field }) => (
                  <Select
                    value={String(field.value ?? 0)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="w-full">
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
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("genderPreference")}</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    value={String(field.value ?? 0)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("genderPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {te(`gender.${opt.value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{t("sort")}</Label>
              <Controller
                control={control}
                name="orderBy"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-2 gap-2"
                  >
                    <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-2">
                      <RadioGroupItem value="price-asc" />
                      <span className="flex items-center gap-1 text-sm">
                        {t("price")} <TrendingUp size={16} className="text-emerald-500" />
                      </span>
                    </Label>
                    <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-2">
                      <RadioGroupItem value="price-desc" />
                      <span className="flex items-center gap-1 text-sm">
                        {t("price")} <TrendingDown size={16} className="text-destructive" />
                      </span>
                    </Label>
                    <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-2">
                      <RadioGroupItem value="createdAt-asc" />
                      <span className="flex items-center gap-1 text-sm">
                        {t("date")} <TrendingUp size={16} className="text-emerald-500" />
                      </span>
                    </Label>
                    <Label className="flex cursor-pointer items-center gap-2 rounded-md border p-2">
                      <RadioGroupItem value="createdAt-desc" />
                      <span className="flex items-center gap-1 text-sm">
                        {t("date")} <TrendingDown size={16} className="text-destructive" />
                      </span>
                    </Label>
                  </RadioGroup>
                )}
              />
            </div>

            <div className="flex gap-2 pt-2">
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
