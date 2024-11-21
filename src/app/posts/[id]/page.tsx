import { FeaturedUsers } from "~/app/_components/FeaturedUsers";
import { PostModal } from "~/app/_components/PostModal";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient, api } from "~/trpc/server";

type PostPageProps = { params: { id: string } };

export default async function Page({ params: { id } }: PostPageProps) {
  const session = await getServerAuthSession();
  const post = await api.post.getById(id);

  if (!post) return "Post not found";
  const canEdit = session?.user.id === post.createdById;

  return (
    <HydrateClient>
      <div className="card bg-base-100 flex w-full flex-col gap-8 p-8 shadow-xl">
        <div className="skeleton h-60"></div>
        <FeaturedUsers {...post} />
        <p className="">{post.description}</p>
        {canEdit && <PostModal post={post} userId={session?.user.id} />}
        <button className="btn btn-secondary">Jelentkezés</button>
      </div>
    </HydrateClient>
  );
}
