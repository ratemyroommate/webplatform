import { XMarkIcon } from "@heroicons/react/24/outline";

export const XButton = () => (
  <form method="dialog">
    <button className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2">
      <XMarkIcon width={25} />
    </button>
  </form>
);
