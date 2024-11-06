import { PlusIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { Post } from "~/app/_components/Post";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const posts = await api.post.getLatest();

  return (
    <HydrateClient>
      <Link href="/posts/new" className="btn btn-secondary w-full shadow-xl">
        <PlusIcon width={40} />
      </Link>
      {posts.map((post) => (
        <Post {...post} key={post.id} />
      ))}
    </HydrateClient>
  );
}
