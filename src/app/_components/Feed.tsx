"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { PostModal } from "./PostModal";
import { Post } from "./post";
import { PostSkeletons } from "./PostSkeletons";

type FeedProps = { userId?: string };

export const Feed = ({ userId }: FeedProps) => {
  const bottom = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({});
  const { data, fetchNextPage, isLoading } =
    api.post.getLatest.useInfiniteQuery(
      { filters },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) fetchNextPage();
    });
    if (bottom.current) observer.observe(bottom.current);
  }, []);

  return (
    <>
      <PostModal userId={userId} />
      {data?.pages.map((page) =>
        page.posts.map((post) => (
          <Post post={post} key={post.id} userId={userId} />
        )),
      )}
      {isLoading && <PostSkeletons />}
      <div ref={bottom} />
    </>
  );
};
