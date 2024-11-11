import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const reviewRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        rating: z.number(),
        comment: z.string(),
        reviewedId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.db.review.create({
        data: {
          ...input,
          reviewerId: ctx.session.user.id,
        },
      }),
    ),
});
