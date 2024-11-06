"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import { Post } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "~/trpc/react";

type FormValues = Omit<
  Post,
  "id" | "createdAt" | "updatedAt" | "createdById"
> & { isResident: boolean };

const defaultValues = { description: "", maxPersonCount: 2, isResident: true };
const maxPersonCount = { min: 2, max: 6 };

export default function NewPost() {
  const {
    register,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({ defaultValues });

  const router = useRouter();
  const utils = api.useUtils();
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      router.push("/");
    },
  });

  const handleDecrease = () => {
    const currentValue = Number(getValues("maxPersonCount"));
    if (currentValue === maxPersonCount.min) return;
    setValue("maxPersonCount", currentValue - 1);
  };

  const handleIncrease = () => {
    const currentValue = Number(getValues("maxPersonCount"));
    if (currentValue === maxPersonCount.max) return;
    setValue("maxPersonCount", currentValue + 1);
  };

  const onSubmit = async (formValues: FormValues) => {
    createPost.mutate(formValues);
  };

  return (
    <form
      className="card bg-base-100 flex w-full flex-col p-8 shadow-xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text text-lg">Leírás</span>
        </div>
        <textarea
          placeholder="Keresünk egy hozzánk hasonló..."
          className="textarea textarea-bordered textarea-lg w-full"
          {...register("description", { required: "A leírás kötelező" })}
        ></textarea>
        {errors.description && (
          <div className="label">
            <span className="label-text-alt text-error">
              {errors.description.message}
            </span>
          </div>
        )}
      </label>
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text text-lg">Személyek száma</span>
        </div>
        <div className="flex gap-4">
          <button
            className="btn btn-square md:btn-wide"
            onClick={handleDecrease}
            type="button"
          >
            <MinusIcon width={20} />
          </button>
          <input
            min={2}
            max={6}
            type="number"
            className="input input-bordered w-full"
            {...register("maxPersonCount", { min: 2, max: 6 })}
          />
          <button
            className="btn btn-square md:btn-wide"
            onClick={handleIncrease}
            type="button"
          >
            <PlusIcon width={20} />
          </button>
        </div>
      </label>
      <div className="form-control py-2">
        <label className="label cursor-pointer justify-start gap-4">
          <span className="label-text text-lg">Én is lakó vagyok</span>
          <input
            type="checkbox"
            {...register("isResident")}
            className="checkbox"
          />
        </label>
      </div>
      <button
        disabled={isSubmitting || createPost.isPending}
        className="btn btn-secondary btn-wide mt-4 self-center"
      >
        Közzététel
      </button>
    </form>
  );
}
