import type { Post } from "@prisma/client";
import { MapPinIcon, UserIcon } from "@heroicons/react/24/outline";
import { getAgeLabel, getGenderLabel, getLocationLabel } from "~/utils/helpers";

type PostInfoProps = {
  post: Post;
};

export const PostInfo = ({ post }: PostInfoProps) => {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{post.price}k</span>
        <span className="text-sm opacity-50">ft/hónap</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="badge badge-lg gap-1.5 py-3">
          <MapPinIcon width={16} color="brown" />
          {getLocationLabel(post.location)}
        </div>
        <div className="badge badge-lg gap-1.5 py-3">
          <UserIcon width={16} color="red" />
          {getAgeLabel(post.age)}
        </div>
        <div className="badge badge-lg gap-1.5 py-3">
          <img src="/gender-fluid.png" width={16} />
          {getGenderLabel(post.gender)}
        </div>
      </div>
    </div>
  );
};
