import { BanknotesIcon } from "@heroicons/react/24/outline";

type PostPriceProps = {
  price: number;
};

export const PostPrice = ({ price }: PostPriceProps) => (
  <div className="flex flex-col items-center justify-center">
    <span className="text-sm text-gray-500">ft/fő/hónap</span>
    <div className="flex gap-2">
      <b>{price}k</b>
      <BanknotesIcon width={24} color="green" />
    </div>
  </div>
);
