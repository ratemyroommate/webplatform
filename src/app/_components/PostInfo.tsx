import type { Post } from "@prisma/client";
import { PostPrice } from "./PostPrice";
import { MapPinIcon, UserIcon } from "@heroicons/react/24/outline";
import { getAgeLabel, getLocationLabel } from "~/utils/helpers";

type PostInfoProps = {
  post: Post;
};

export const PostInfo = ({ post }: PostInfoProps) => {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2">
      <PostPrice price={post.price} />
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <MapPinIcon width={24} color="brown" />
          <b>{getLocationLabel(post.location)}</b>
        </div>
      </div>
      <div className="flex">
        <div className="flex items-center gap-2">
          <UserIcon width={24} color="red" />
          <b>{getAgeLabel(post.age)}</b>
        </div>
      </div>
      <div className="flex">
        <div className="flex items-center gap-2">
          <img src="/gender-fluid.png" width={25} />
          <b>Fiú - Lány</b>
        </div>
      </div>
    </div>
  );
};
