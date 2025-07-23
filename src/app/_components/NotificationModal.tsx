"use client";

import {
  BellIcon,
  CheckIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { handleCloseModal, handleOpenModal } from "./LoginModal";
import { api } from "~/trpc/react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RequestStatus } from "@prisma/client";
import { toast } from "react-hot-toast";
import { NotificationBell } from "./NotificationBell";
import { XButton } from "./CloseButton";

export const NotificationModal = () => {
  const { data: requests, isLoading } = api.request.getAll.useQuery();
  const recievedRequests = requests?.recievedRequests;
  const sentRequests = requests?.sentRequests;
  const pathname = usePathname();
  const router = useRouter();
  const utils = api.useUtils();
  const updateRequest = api.request.update.useMutation({
    onSuccess: () => {
      router.refresh();
      void utils.request.getAll.invalidate();
      toast.success("Request updated successfully");
    },
  });
  useEffect(() => handleCloseModal("notification-modal"), [pathname]);

  return (
    <>
      <NotificationBell requests={recievedRequests}>
        <BellIcon
          onClick={() => handleOpenModal("notification-modal")}
          width={30}
        />
      </NotificationBell>
      <dialog id="notification-modal" className="modal">
        <div className="modal-box px-4">
          <XButton />
          <h3 className="pb-4 text-lg font-bold">Kapott kérelmek</h3>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
            </div>
          ) : recievedRequests?.length ? (
            <div className="flex flex-col gap-2">
              {recievedRequests?.map((request) => (
                <div
                  key={request.id}
                  className="card border-base-200 border-2 p-2"
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flew-row flex items-center gap-4">
                      <Link
                        className="h-10 w-10"
                        href={`/users/${request.user.id}`}
                      >
                        <div className="avatar">
                          <div className="rounded-full">
                            <img src={request.user.image ?? ""} />
                          </div>
                        </div>
                      </Link>
                      <div className="w-2/3">
                        <div className="line-clamp-1 overflow-hidden">
                          {request.user.name}
                        </div>
                        <Badge status={request.status} />
                      </div>
                    </div>
                    {request.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-square btn-success"
                          onClick={() =>
                            updateRequest.mutate({
                              requestId: request.id,
                              status: "ACCEPTED",
                            })
                          }
                        >
                          <CheckIcon width={20} />
                        </button>
                        <button
                          className="btn btn-square btn-error"
                          onClick={() =>
                            updateRequest.mutate({
                              requestId: request.id,
                              status: "DENIED",
                            })
                          }
                        >
                          <XMarkIcon width={20} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div tabIndex={0} className="collapse-arrow collapse">
                    <div className="collapse-title">További adatok</div>
                    <div className="collapse-content flex flex-col gap-2">
                      {request.comment === ""
                        ? "Nincs megjegyzés"
                        : request.comment}
                      <Link href={`/posts/${request.postId}`} className="btn">
                        Kapcsolatos poszt
                        <EyeIcon width={20} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            "Nincs kapott kérelem"
          )}

          <h3 className="py-4 text-lg font-bold">Küldött kérelmek</h3>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
              <div className="skeleton h-16 w-full"></div>
            </div>
          ) : sentRequests?.length ? (
            <div className="flex flex-col gap-2">
              {sentRequests?.map((request) => (
                <div
                  key={request.id}
                  className="card border-base-200 border-2 p-2"
                >
                  <div className="flex flex-row items-center justify-between">
                    <Link href={`/posts/${request.postId}`} className="btn">
                      Poszt
                      <EyeIcon width={20} />
                    </Link>
                    <div className="flew-row flex items-center gap-4">
                      <div className="w-2/3">
                        <Badge status={request.status} />
                      </div>
                    </div>
                    {request.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-square btn-error"
                          onClick={() =>
                            updateRequest.mutate({
                              requestId: request.id,
                              status: "DENIED",
                            })
                          }
                        >
                          <XMarkIcon width={20} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div tabIndex={0} className="collapse-arrow collapse">
                    <div className="collapse-title">További adatok</div>
                    <div className="collapse-content flex flex-col gap-2">
                      {request.comment === ""
                        ? "Nincs megjegyzés"
                        : request.comment}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            "Nincs küldött kérelem"
          )}
        </div>
      </dialog>
    </>
  );
};

const Badge = ({ status }: { status: RequestStatus }) => {
  switch (status) {
    case "ACCEPTED":
      return <div className="badge badge-success">{status}</div>;
    case "DENIED":
      return <div className="badge badge-error">{status}</div>;
    default:
      return <div className="badge badge-warning">{status}</div>;
  }
};
