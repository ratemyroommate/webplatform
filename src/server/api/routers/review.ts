import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const reviewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        rating: z.number(),
        comment: z.string().nullable(),
        reviewedId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.review.create({
        data: {
          ...input,
          reviewerId: ctx.session.user.id,
        },
      }),
    ),
  update: protectedProcedure
    .input(
      z.object({
        rating: z.number(),
        comment: z.string().nullable(),
        reviewedId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      ctx.db.review.update({
        where: {
          reviewerId_reviewedId: {
            reviewedId: input.reviewedId,
            reviewerId: ctx.session.user.id,
          },
        },
        data: {
          rating: input.rating,
          comment: input.comment,
        },
      }),
    ),
});
