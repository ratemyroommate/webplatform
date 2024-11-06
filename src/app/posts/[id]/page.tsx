import { api } from "~/trpc/server";

type PostPageProps = { params: { id: string } };

export default async function Page({ params }: PostPageProps) {
  const post = await api.post.getById(params.id);

  if (!post) return "Post not found";

  return <div>Post page {post.id}</div>;
}
