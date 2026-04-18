import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";

type PostPriceProps = {
  price: number;
};

export const PostPrice = ({ price }: PostPriceProps) => {
  const t = useTranslations("post");
  return (
    <div className="tooltip flex flex-1 items-center gap-2" data-tip={t("rentTooltip")}>
      <BanknotesIcon width={24} color="green" />
      <b>{price}k</b>
      <span className="text-sm text-gray-500">{t("priceUnit")}</span>
    </div>
  );
};
