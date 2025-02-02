import { FormValues } from "./Filters";

type NotificationBellProps = {
  children: React.ReactNode;
  filters: FormValues;
};

export const FiltersIndicator = ({
  children,
  filters,
}: NotificationBellProps) => {
  const indicatorCount =
    Object.values(filters).filter((filter) => !!filter).length - 1;

  return indicatorCount > 0 ? (
    <div className="indicator">
      <span className="badge indicator-item badge-warning">
        {indicatorCount}
      </span>

      {children}
    </div>
  ) : (
    children
  );
};
