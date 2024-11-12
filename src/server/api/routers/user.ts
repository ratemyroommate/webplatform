import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getById: publicProcedure.input(z.string()).query(({ ctx, input }) =>
    ctx.db.user.findUnique({
      where: { id: input },
      include: { reviewsReceived: { include: { reviewer: true } } },
    }),
  ),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        about: z.string().nullable(),
        socialLink: z.string().min(1).nullable(),
      }),
    )
    .mutation(({ ctx, input }) => {
      if (ctx.session.user.id !== input.id) {
        throw new TRPCError({
          message: "Cannot update different profile",
          code: "UNAUTHORIZED",
        });
      }
      return ctx.db.user.update({
        where: { id: input.id },
        data: { about: input.about, socialLink: input.socialLink },
      });
    }),
});
