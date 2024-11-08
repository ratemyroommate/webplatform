import { FeaturedUsers } from "~/app/_components/FeaturedUsers";
import { api } from "~/trpc/server";

type PostPageProps = { params: { id: string } };

export default async function Page({ params: { id } }: PostPageProps) {
  const post = await api.post.getById(id);

  if (!post) return "Post not found";

  return (
    <div className="card bg-base-100 flex w-full flex-col gap-8 p-8 shadow-xl">
      <div className="skeleton h-60"></div>
      <FeaturedUsers {...post} />
      <p className="">{post.description}</p>
      <button className="btn btn-secondary">Jelentkezés</button>
    </div>
  );
}
