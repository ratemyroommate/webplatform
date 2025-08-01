import {
  AdjustmentsHorizontalIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { handleCloseModal, handleOpenModal } from "./LoginModal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { orderBy } from "~/server/api/routers/post";
import { FiltersIndicator } from "./FiltersIndicator";
import { Dispatch } from "react";
import { XButton } from "./CloseButton";

type FiltersProps = { filters: FormValues; setFilters: Dispatch<FormValues> };
export type FormValues = {
  maxPersonCount?: number;
  maxPrice?: number;
  orderBy?: OrderBy;
};
export type OrderBy = z.infer<typeof orderBy>;

const defaultFilters: FormValues = {
  orderBy: "createdAt-desc",
  maxPersonCount: 0,
  maxPrice: 0,
};

export const Filters = ({ filters, setFilters }: FiltersProps) => {
  const { reset, register, handleSubmit, watch, setValue } =
    useForm<FormValues>({
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
          <button onClick={resetFilters} className="btn btn-sm mb-4">
            Szűrők törlése <TrashIcon width={18} />
          </button>
          <h3 className="text-lg font-bold">Szűrés</h3>
          <XButton />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center gap-6 pt-4"
          >
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-lg">Lakótársak száma</span>
              </div>
              <div className="flex justify-between gap-2">
                {Array.from({ length: 4 }, (_, i) => i + 2).map((n) => (
                  <button
                    key={n}
                    className={`btn flex-1 ${watch("maxPersonCount") == n ? "btn-secondary" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setValue(
                        "maxPersonCount",
                        watch("maxPersonCount") === n ? 0 : n,
                      );
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-lg">
                  Maximum ár{" "}
                  <span className="text-sm text-gray-500">
                    ( {watch("maxPrice")}k ft/fő/hónap )
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
            <h3 className="self-start text-lg font-bold">Rendezés</h3>
            <div className="flex w-full gap-4">
              <div className="form-control w-1/4">
                <label className="label flex cursor-pointer flex-col gap-2">
                  <span className="label-text flex items-center gap-1">
                    Ár <ArrowTrendingUpIcon width={20} color="green" />
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
                    Ár <ArrowTrendingDownIcon width={20} color="red" />
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
                    Dátum <ArrowTrendingUpIcon width={20} color="green" />
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
                    Dátum <ArrowTrendingDownIcon width={20} color="red" />
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
            <button type="submit" className="btn btn-secondary btn-wide">
              Alkalmaz
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
};
