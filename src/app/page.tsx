import { Post } from "~/app/_components/Post";
import { api, HydrateClient } from "~/trpc/server";
import { PostModal } from "./_components/PostModal";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const posts = await api.post.getLatest();
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      <PostModal userId={session?.user.id} />
      {posts.map((post) => (
        <Post post={post} userId={session?.user.id} key={post.id} />
      ))}
    </HydrateClient>
  );
}
