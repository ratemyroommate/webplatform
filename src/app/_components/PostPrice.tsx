import { Banknote } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

type PostPriceProps = {
  price: number;
};

export const PostPrice = ({ price }: PostPriceProps) => {
  const t = useTranslations("post");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-1 items-center gap-2">
          <Banknote className="text-primary" size={24} />
          <b>{price}k</b>
          <span className="text-muted-foreground text-sm">{t("priceUnit")}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>{t("rentTooltip")}</TooltipContent>
    </Tooltip>
  );
};
