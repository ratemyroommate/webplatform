import { type Metadata } from "next";
import { Images } from "~/app/_components/Images";
import { FeaturedUsers } from "~/app/_components/FeaturedUsers";
import { PostDelete } from "~/app/_components/PostDelete";
import { PostModal } from "~/app/_components/PostModal";
import { RequestModal } from "~/app/_components/RequestModal";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import { PostInfo } from "~/app/_components/PostInfo";
import Image from "next/image";
import Link from "next/link";
import { CompatibilityScore } from "~/app/_components/CompatibilityScore";
import { getTranslations } from "next-intl/server";

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
      <div className="card bg-base-100 w-full overflow-hidden shadow-xl">
        {/* Accent gradient stripe */}
        <div className="from-primary via-secondary to-accent h-1.5 w-full bg-gradient-to-r" />

        {/* Hero image */}
        <Images images={post.images} />

        <div className="flex flex-col gap-6 p-6">
          {/* Price & Location header */}
          <PostInfo post={post} />

          <div className="divider my-0" />

          {/* Roommates section */}
          <div className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase opacity-60">
              <span>{t("roommates")}</span>
              <span className="badge badge-outline badge-sm">
                {post.featuredUsers.length}/{post.maxPersonCount}
              </span>
            </h3>
            <FeaturedUsers {...post} />
          </div>

          {/* Description */}
          {post.description && (
            <>
              <div className="divider my-0" />
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold tracking-wide uppercase opacity-60">
                  {t("description")}
                </h3>
                <p className="leading-relaxed opacity-80">{post.description}</p>
              </div>
            </>
          )}

          <div className="divider my-0" />

          {/* Posted by — bordered card style */}
          <Link
            href={`/users/${post.createdById}`}
            className="border-base-300 hover:border-primary/30 hover:bg-base-200/50 flex items-center gap-4 rounded-2xl border p-4 transition-all"
          >
            <div className="avatar w-12">
              <div className="ring-primary ring-offset-base-100 w-full rounded-full shadow-md ring-2 ring-offset-2">
                <Image
                  width={100}
                  height={100}
                  src={post.createdBy.image ?? ""}
                  alt={t("advertiserAlt")}
                />
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="badge badge-primary badge-sm">{t("advertiser")}</span>
              <span className="text-lg font-semibold">{post.createdBy.name}</span>
            </div>
          </Link>

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
      </div>
    </HydrateClient>
  );
}
