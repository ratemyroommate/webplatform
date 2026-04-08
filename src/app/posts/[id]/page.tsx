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

type PostPageProps = { params: { id: string } };

export default async function Page({ params: { id } }: PostPageProps) {
  const session = await getServerAuthSession();
  const post = await api.post.getById(id);

  if (!post) return "Post not found";
  const canEdit = session?.user.id === post.createdById;
  const canRequest =
    !session?.user.id ||
    (post.createdById !== session.user.id &&
      !post.requests
        .map((request) => request.userId)
        .includes(session.user.id));

  return (
    <HydrateClient>
      <div className="card bg-base-100 w-full overflow-hidden shadow-xl">
        {/* Hero image */}
        <Images images={post.images} />

        <div className="flex flex-col gap-5 p-5">
          {/* Price & Location header */}
          <div className="flex items-center justify-between">
            <PostInfo post={post} />
          </div>

          <div className="divider my-0" />

          {/* Roommates section */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase opacity-60">
              Szobatársak
            </h3>
            <FeaturedUsers {...post} />
          </div>

          {/* Description */}
          {post.description && (
            <>
              <div className="divider my-0" />
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold tracking-wide uppercase opacity-60">
                  Leírás
                </h3>
                <p className="leading-relaxed">{post.description}</p>
              </div>
            </>
          )}

          <div className="divider my-0" />

          {/* Posted by */}
          <Link
            href={`/users/${post.createdById}`}
            className="bg-base-200 hover:bg-base-300 flex items-center gap-3 rounded-xl p-3 transition-colors"
          >
            <div className="avatar w-10">
              <div className="w-full rounded-full">
                <Image
                  width={100}
                  height={100}
                  src={post.createdBy.image ?? ""}
                  alt="hirdette"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs opacity-60">Meghirdette</span>
              <span className="font-medium">{post.createdBy.name}</span>
            </div>
          </Link>

          {/* Compatibility */}
          <CompatibilityScore
            compareUserId={post.createdById}
            session={session}
          />

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {canEdit && (
              <div className="flex w-full gap-2">
                <PostModal post={post} userId={session?.user.id} />
                <PostDelete id={post.id} />
              </div>
            )}
            {canRequest && (
              <RequestModal postId={post.id} userId={session?.user.id} />
            )}
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
