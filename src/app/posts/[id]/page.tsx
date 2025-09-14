import { Images } from "~/app/_components/Images";
import { FeaturedUsers } from "~/app/_components/FeaturedUsers";
import { PostDelete } from "~/app/_components/PostDelete";
import { PostModal } from "~/app/_components/PostModal";
import { RequestModal } from "~/app/_components/RequestModal";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";
import { PostInfo } from "~/app/_components/PostInfo";

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
        <p className="">{post.description}</p>
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
