import { type Metadata } from "next";
import { Images } from "~/app/_components/Images";
import { FeaturedUsers } from "~/app/_components/FeaturedUsers";
import { PostDelete } from "~/app/_components/PostDelete";
import { PostModal } from "~/app/_components/PostModal";
import { RequestModal } from "~/app/_components/RequestModal";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import { PostInfo } from "~/app/_components/PostInfo";
import Link from "next/link";
import { Phone } from "lucide-react";
import { CompatibilityScore } from "~/app/_components/CompatibilityScore";
import { getTranslations } from "next-intl/server";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

type PostPageProps = { params: { id: string } };

export async function generateMetadata({ params: { id } }: PostPageProps): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const post = await api.post.getById(id);
  if (!post) return { title: t("home.title") };
  return {
    title: t("post.title", { location: post.location }),
    description: t("post.description", { location: post.location, price: post.price }),
  };
}

export default async function Page({ params: { id } }: PostPageProps) {
  const session = await getServerAuthSession();
  const post = await api.post.getById(id);
  const t = await getTranslations("post");

  if (!post) return t("notFound");
  const canEdit = session?.user.id === post.createdById;
  const canRequest =
    !session?.user.id ||
    (post.createdById !== session.user.id &&
      !post.requests.map((request) => request.userId).includes(session.user.id));

  return (
    <HydrateClient>
      <Card className="w-full gap-0 overflow-hidden p-0">
        {/* Accent stripe */}
        <div className="bg-primary h-1.5 w-full" />

        {/* Hero image */}
        <Images images={post.images} />

        <div className="flex flex-col gap-6 p-6">
          <PostInfo post={post} />

          <Separator />

          {/* Roommates */}
          <div className="flex flex-col gap-3">
            <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
              <span>{t("roommates")}</span>
              <Badge variant="outline">
                {post.featuredUsers.length}/{post.maxPersonCount}
              </Badge>
            </h3>
            <FeaturedUsers {...post} />
          </div>

          {/* Description */}
          {post.description && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                  {t("description")}
                </h3>
                <p className="leading-relaxed">{post.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Posted by */}
          <div className="flex items-center gap-4 rounded-2xl border p-4">
            <Link href={`/users/${post.createdById}`}>
              <Avatar className="ring-primary ring-offset-background size-12 shadow-md ring-2 ring-offset-2">
                {post.createdBy.image && (
                  <AvatarImage src={post.createdBy.image} alt={t("advertiserAlt")} />
                )}
                <AvatarFallback>
                  {post.createdBy.name?.charAt(0).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <Badge>{t("advertiser")}</Badge>
                {post.createdBy.phoneNumber && (
                  <a
                    href={`tel:${post.createdBy.phoneNumber}`}
                    className="text-primary flex items-center gap-1 text-sm hover:underline"
                  >
                    <Phone size={14} />
                    {post.createdBy.phoneNumber}
                  </a>
                )}
              </div>
              <Link
                href={`/users/${post.createdById}`}
                className="text-lg font-semibold hover:underline"
              >
                {post.createdBy.name}
              </Link>
            </div>
          </div>

          {/* Compatibility */}
          <CompatibilityScore compareUserId={post.createdById} session={session} />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {canEdit && (
              <div className="flex w-full gap-2">
                <PostModal post={post} userId={session?.user.id} />
                <PostDelete id={post.id} />
              </div>
            )}
            {canRequest && <RequestModal postId={post.id} userId={session?.user.id} />}
          </div>
        </div>
      </Card>
    </HydrateClient>
  );
}
