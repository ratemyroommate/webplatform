import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.db.user.findUnique({
      where: { id: input },
      include: { reviewsReceived: { include: { reviewer: true } } },
    });
  }),
});
