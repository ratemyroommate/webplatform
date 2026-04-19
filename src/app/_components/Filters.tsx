import {
  AdjustmentsHorizontalIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  FunnelIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { handleCloseModal, handleOpenModal } from "./LoginModal";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { orderBy } from "~/server/api/routers/post";
import { FiltersIndicator } from "./FiltersIndicator";
import type { Dispatch } from "react";
import { XButton } from "./CloseButton";
import { ageOptions, genderOptions, locationOptions } from "~/utils/helpers";
import type { Location } from "@prisma/client";
import { useTranslations } from "next-intl";

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

export const Filters = ({ filters, setFilters }: FiltersProps) => {
  const t = useTranslations("filter");
  const te = useTranslations("enums");
  const { reset, register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: Object.keys(filters).length ? filters : defaultFilters,
  });

  const onSubmit = (formValues: FormValues) => {
    handleCloseModal("filters-modal");
    setFilters(formValues);
  };

  const resetFilters = () => {
    handleCloseModal("filters-modal");
    setFilters({});
    reset();
  };

  return (
    <>
      <FiltersIndicator filters={filters}>
        <button
          onClick={() => handleOpenModal("filters-modal")}
          className="btn btn-square bg-base-100 shadow-xl"
        >
          <AdjustmentsHorizontalIcon width={26} />
        </button>
      </FiltersIndicator>
      <dialog id="filters-modal" className="modal">
        <div className="modal-box">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{t("title")}</h3>
            <XButton />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-4 pt-4">
            <div className="form-control w-full">
              <div className="label">
                <span className="label-text text-lg">{t("roommates")}</span>
              </div>
              <div className="join flex">
                {Array.from({ length: 4 }, (_, i) => i + 2).map((n) => (
                  <input
                    key={n}
                    type="radio"
                    className="join-item btn flex-1"
                    aria-label={`${n}`}
                    value={n}
                    {...register("maxPersonCount", { valueAsNumber: true })}
                  />
                ))}
              </div>
            </div>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-lg">
                  {t("maxPrice")}{" "}
                  <span className="text-sm text-gray-500">
                    ( {watch("maxPrice")}
                    {t("maxPriceUnit")} )
                  </span>
                </span>
              </div>
              <input
                {...register("maxPrice", { valueAsNumber: true })}
                type="range"
                className="range w-full"
                min={50}
                max={500}
                step={10}
              />
              <div className="flex w-full justify-between px-2 text-xs">
                {Array.from({ length: 10 }, (_, i) => i * 50 + 50).map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
            </label>
            <label className="form-control flex w-full flex-col">
              <div className="label">
                <span className="label-text text-lg">{t("location")}</span>
              </div>
              <select className="select w-full" {...register("location")}>
                <option disabled={true}>{t("locationPlaceholder")}</option>
                {[{ value: "", label: t("anyLocation") }, ...locationOptions].map(
                  (locationOption) => (
                    <option key={locationOption.value} value={locationOption.value}>
                      {locationOption.value
                        ? te(`location.${locationOption.value}`)
                        : locationOption.label}
                    </option>
                  )
                )}
              </select>
            </label>
            <label className="form-control flex w-full flex-col">
              <div className="label">
                <span className="label-text text-lg">{t("ageLabel")}</span>
              </div>
              <select className="select w-full" {...register("age", { valueAsNumber: true })}>
                <option disabled={true}>{t("agePlaceholder")}</option>
                {ageOptions.map((ageOption) => (
                  <option key={ageOption.value} value={ageOption.value}>
                    {te(`age.${ageOption.value}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control flex w-full flex-col">
              <div className="label">
                <span className="label-text text-lg">{t("genderPreference")}</span>
              </div>
              <select className="select w-full" {...register("gender", { valueAsNumber: true })}>
                <option disabled={true}>{t("genderPlaceholder")}</option>
                {genderOptions.map((genderOption) => (
                  <option key={genderOption.value} value={genderOption.value}>
                    {te(`gender.${genderOption.value}`)}
                  </option>
                ))}
              </select>
            </label>
            <h3 className="self-start text-lg font-bold">{t("sort")}</h3>
            <div className="flex w-full gap-4">
              <div className="form-control w-1/4">
                <label className="label flex cursor-pointer flex-col gap-2">
                  <span className="label-text flex items-center gap-1">
                    {t("price")} <ArrowTrendingUpIcon width={20} color="green" />
                  </span>
                  <input
                    type="radio"
                    value="price-asc"
                    {...register("orderBy")}
                    className="radio checked:text-green-500"
                  />
                </label>
              </div>
              <div className="form-control w-1/4">
                <label className="label flex cursor-pointer flex-col gap-2">
                  <span className="label-text flex items-center gap-1">
                    {t("price")} <ArrowTrendingDownIcon width={20} color="red" />
                  </span>
                  <input
                    type="radio"
                    value="price-desc"
                    {...register("orderBy")}
                    className="radio checked:text-red-500"
                  />
                </label>
              </div>
              <div className="form-control w-1/4">
                <label className="label flex cursor-pointer flex-col gap-2">
                  <span className="label-text flex items-center gap-1">
                    {t("date")} <ArrowTrendingUpIcon width={20} color="green" />
                  </span>
                  <input
                    type="radio"
                    value={"createdAt-asc"}
                    {...register("orderBy")}
                    className="radio checked:text-green-500"
                  />
                </label>
              </div>
              <div className="form-control w-1/4">
                <label className="label flex cursor-pointer flex-col gap-2">
                  <span className="label-text flex items-center gap-1">
                    {t("date")} <ArrowTrendingDownIcon width={20} color="red" />
                  </span>
                  <input
                    type="radio"
                    value={"createdAt-desc"}
                    {...register("orderBy")}
                    className="radio checked:text-red-500"
                  />
                </label>
              </div>
            </div>
            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-outline btn-error flex-1"
              >
                <TrashIcon width={18} /> {t("reset")}
              </button>
              <button type="submit" className="btn btn-secondary flex-1">
                <FunnelIcon width={18} /> {t("apply")}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
};
