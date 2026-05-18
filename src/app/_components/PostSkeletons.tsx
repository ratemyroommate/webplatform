"use client";

import { Skeleton } from "boneyard-js/react";
import { PostCardFixture } from "./skeleton-fixtures";

const COUNT = 4;

export const PostSkeletons = () => (
  <>
    {Array.from({ length: COUNT }).map((_, i) => (
      <Skeleton
        key={i}
        name="post-card"
        loading
        animate="shimmer"
        fixture={<PostCardFixture />}
      >
        <PostCardFixture />
      </Skeleton>
    ))}
  </>
);
