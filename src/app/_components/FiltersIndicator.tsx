import { FormValues } from "./Filters";

type NotificationBellProps = {
  children: React.ReactNode;
  filters: FormValues;
};

export const FiltersIndicator = ({
  children,
  filters,
}: NotificationBellProps) =>
  Object.keys(filters).length ? (
    <div className="indicator">
      <span className="badge indicator-item badge-warning">
        {Object.keys(filters).length - 1}
      </span>

      {children}
    </div>
  ) : (
    children
  );
