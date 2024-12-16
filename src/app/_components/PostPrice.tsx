import { BanknotesIcon } from "@heroicons/react/24/outline";

type PostPriceProps = {
  price: number;
};

export const PostPrice = ({ price }: PostPriceProps) => (
  <div className="flex items-center gap-2">
    <BanknotesIcon width={20} />
    <b>
      {price}
      <span className="text-sm">k ft/fő/hónap</span>
    </b>
  </div>
);
