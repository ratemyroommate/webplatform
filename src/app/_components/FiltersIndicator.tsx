import type { FormValues } from "./Filters";
import { Badge } from "~/components/ui/badge";

type NotificationBellProps = {
  children: React.ReactNode;
  filters: FormValues;
};

export const FiltersIndicator = ({ children, filters }: NotificationBellProps) => {
  const indicatorCount = Object.values(filters).filter((filter) => !!filter).length - 1;

  return indicatorCount > 0 ? (
    <div className="relative inline-flex">
      {children}
      <Badge className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs">
        {indicatorCount}
      </Badge>
    </div>
  ) : (
    children
  );
};
