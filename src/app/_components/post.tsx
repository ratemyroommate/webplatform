import Link from "next/link";
import { FeaturedUsers } from "./FeaturedUsers";
import { Images } from "./Images";
import { PostPrice } from "./PostPrice";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { getLocationLabel } from "~/utils/helpers";

type PostProps = {
  post: PostExtended;
  userId?: string;
};

export const Post = ({ post, userId }: PostProps) => {
  const canEdit = userId === post.createdById;

  return (
    <Link
      href={`/posts/${post.id}`}
      className="card bg-base-100 flex w-full flex-col items-center justify-between gap-6 p-4 shadow-xl sm:flex-row"
    >
      <Images images={post.images} />
      <div className="flex w-full flex-col gap-4">
        <FeaturedUsers {...post} />
        <div className="flex justify-around gap-4">
          <PostPrice price={post.price} />
          <div className="flex flex-1 items-center gap-2">
            <MapPinIcon width={24} color="brown" />
            <b>{getLocationLabel(post.location)}</b>
          </div>
        </div>
      </div>
    </Link>
  );
};
