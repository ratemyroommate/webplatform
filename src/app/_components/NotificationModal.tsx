"use client";

import { Bell, Check, Eye, X } from "lucide-react";
import { api } from "~/trpc/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Request, RequestStatus } from "@prisma/client";
import { toast } from "sonner";
import { NotificationBell } from "./NotificationBell";
import type { Session } from "next-auth";
import { CompatibilityScore } from "./CompatibilityScore";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

export const NotificationModal = ({ session }: { session: Session }) => {
  const t = useTranslations("notification");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
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
      toast.success(t("updateSuccess"));
    },
  });
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <NotificationBell requests={recievedRequests}>
        <button aria-label="notifications" onClick={() => setOpen(true)} className="cursor-pointer">
          <Bell size={26} />
        </button>
      </NotificationBell>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto p-4 sm:max-w-md">
          <SheetHeader className="p-0">
            <SheetTitle>{t("title")}</SheetTitle>
          </SheetHeader>
          <Tabs defaultValue="received" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="received" className="flex-1">
                {t("receivedTab")}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex-1">
                {t("sentTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="mt-4">
              {isLoading ? (
                <LoadingList />
              ) : recievedRequests?.length ? (
                <div className="flex flex-col gap-2">
                  {recievedRequests.map((request) => (
                    <RecievedRequest
                      key={request.id}
                      session={session}
                      request={request}
                      updateRequest={updateRequest}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t("noReceived")}</p>
              )}
            </TabsContent>

            <TabsContent value="sent" className="mt-4">
              {isLoading ? (
                <LoadingList />
              ) : sentRequests?.length ? (
                <div className="flex flex-col gap-2">
                  {sentRequests.map((request) => (
                    <Card key={request.id} className="gap-2 p-3">
                      <div className="flex flex-row items-center justify-between gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/posts/${request.postId}`}>
                            {t("post")}
                            <Eye />
                          </Link>
                        </Button>
                        <StatusBadge status={request.status} />
                        {request.status === "PENDING" && (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() =>
                              updateRequest.mutate({
                                requestId: request.id,
                                status: "DENIED",
                              })
                            }
                          >
                            <X />
                          </Button>
                        )}
                      </div>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="details">
                          <AccordionTrigger>{tc("moreDetails")}</AccordionTrigger>
                          <AccordionContent>
                            {request.comment === "" ? tc("noComment") : request.comment}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t("noSent")}</p>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
};

const LoadingList = () => (
  <div className="flex flex-col gap-2">
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
  </div>
);

const StatusBadge = ({ status }: { status: RequestStatus }) => {
  switch (status) {
    case "ACCEPTED":
      return <Badge className="bg-emerald-500 hover:bg-emerald-500">{status}</Badge>;
    case "DENIED":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge className="bg-amber-500 hover:bg-amber-500">{status}</Badge>;
  }
};

const RecievedRequest = ({
  session,
  request,
  updateRequest,
}: {
  session: Session;
  request: Request & {
    user: { id: string; image: string | null; name: string | null };
  };
  updateRequest: ReturnType<typeof api.request.update.useMutation>;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("notification");
  const tc = useTranslations("common");
  return (
    <Card className="gap-2 p-3" onClick={() => setIsOpen(true)}>
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href={`/users/${request.user.id}`}>
            <Avatar className="size-10">
              {request.user.image && (
                <AvatarImage src={request.user.image} alt={request.user.name ?? "Profile image"} />
              )}
              <AvatarFallback>{request.user.name?.charAt(0).toUpperCase() ?? "?"}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col gap-1">
            <div className="line-clamp-1 text-sm">{request.user.name}</div>
            <StatusBadge status={request.status} />
          </div>
        </div>
        {request.status === "PENDING" && (
          <div className="flex gap-2">
            <Button
              size="icon"
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={(e) => {
                e.stopPropagation();
                updateRequest.mutate({ requestId: request.id, status: "ACCEPTED" });
              }}
            >
              <Check />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                updateRequest.mutate({ requestId: request.id, status: "DENIED" });
              }}
            >
              <X />
            </Button>
          </div>
        )}
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="details">
          <AccordionTrigger>{tc("moreDetails")}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2">
            {request.comment === "" ? tc("noComment") : request.comment}
            {isOpen && <CompatibilityScore compareUserId={request.userId} session={session} />}
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="w-1/2">
                <Link href={`/posts/${request.postId}`}>{t("relatedPost")}</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-1/2">
                <Link href={`/compatibility-kviz/${request.userId}`}>{t("quizAnswers")}</Link>
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};
