import { BanknotesIcon } from "@heroicons/react/24/outline";

type PostPriceProps = {
  price: number;
};

export const PostPrice = ({ price }: PostPriceProps) => (
  <div
    className="tooltip flex flex-1 items-center gap-2"
    data-tip="Bérleti díj"
  >
    <BanknotesIcon width={24} color="green" />
    <b>{price}k</b>
    <span className="text-sm text-gray-500">ft/hónap</span>
  </div>
);
