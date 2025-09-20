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
      <div className="card bg-base-100 flex w-full flex-col gap-6 p-4 shadow-xl">
        <Images images={post.images} />
        <FeaturedUsers {...post} />
        <PostInfo post={post} />
        <p>{post.description}</p>

        <Link
          href={`/users/${post.createdById}`}
          className="flex items-center gap-2"
        >
          <label className="text-sm">Meghirdette:</label>
          <div className="avatar w-6">
            <div className="w-full rounded-full">
              <Image
                width={100}
                height={100}
                src={post.createdBy.image ?? ""}
                alt="hirdette"
              />
            </div>
          </div>
          <div className="text-sm">{post.createdBy.name}</div>
        </Link>
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
    </HydrateClient>
  );
}
