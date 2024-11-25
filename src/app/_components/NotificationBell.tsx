import { Request } from "@prisma/client";

type NotificationBellProps = {
  children: React.ReactElement;
  requests?: Request[];
};

export const NotificationBell = ({
  children,
  requests,
}: NotificationBellProps) =>
  requests?.length ? (
    <div className="indicator">
      <span className="indicator-item badge badge-secondary">
        {requests.length}
      </span>

      {children}
    </div>
  ) : (
    children
  );
