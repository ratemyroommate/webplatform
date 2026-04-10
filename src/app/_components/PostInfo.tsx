import type { Post } from "@prisma/client";
import { MapPinIcon, UserIcon } from "@heroicons/react/24/outline";
import { getAgeLabel, getGenderLabel, getLocationLabel } from "~/utils/helpers";

type PostInfoProps = {
  post: Post;
  compact?: boolean;
};

export const PostInfo = ({ post, compact }: PostInfoProps) => {
  return (
    <div className="flex w-full flex-col gap-3">
      {/* Price — hidden in compact mode (shown as overlay badge on card image instead) */}
      {!compact && (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">
            {post.price}k
          </span>
          <span className="text-sm opacity-50">ft/hónap</span>
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        <div className="badge badge-warning gap-1.5 py-3 font-medium shadow-sm">
          <MapPinIcon width={14} />
          {getLocationLabel(post.location)}
        </div>
        <div className="badge badge-info gap-1.5 py-3 font-medium shadow-sm">
          <UserIcon width={14} />
          {getAgeLabel(post.age)}
        </div>
        <div className="badge badge-secondary gap-1.5 py-3 font-medium shadow-sm">
          <img src="/gender-fluid.png" width={14} />
          {getGenderLabel(post.gender)}
        </div>
      </div>
    </div>
  );
};
