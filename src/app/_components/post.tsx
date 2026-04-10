import Link from "next/link";
import { FeaturedUsers } from "./FeaturedUsers";
import { Images } from "./Images";
import { PostInfo } from "./PostInfo";

type PostProps = {
  post: PostExtended;
};

export const Post = ({ post }: PostProps) => {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="card bg-base-100 group flex w-full flex-col overflow-hidden shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
    >
      {/* Image with price overlay */}
      <div className="relative">
        <Images images={post.images} />
        <div className="absolute bottom-3 left-3 z-10">
          <span className="badge badge-lg badge-success gap-1 font-bold shadow-md">
            {post.price}k ft/hó
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        <FeaturedUsers {...post} compact />
        <PostInfo post={post} compact />
      </div>
    </Link>
  );
};
