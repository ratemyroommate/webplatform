"use client";

import { useState } from "react";
import { PostModal } from "./PostModal";
import { Filters } from "./Filters";
import { FeedPosts } from "./FeedPosts";

type FeedProps = { userId?: string };

export const Feed = ({ userId }: FeedProps) => {
  const [filters, setFilters] = useState({});

  return (
    <>
      <div className="flex w-full gap-2">
        <PostModal userId={userId} />
        <Filters filters={filters} setFilters={setFilters} />
      </div>
      <FeedPosts filters={filters} userId={userId} />
    </>
  );
};
