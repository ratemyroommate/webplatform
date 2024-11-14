import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        description: z.string().min(1).max(200),
        maxPersonCount: z.number().min(2).max(6),
        isResident: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          description: input.description,
          maxPersonCount: input.maxPersonCount,
          createdBy: { connect: { id: ctx.session.user.id } },
          featuredUsers: {
            connect: input.isResident ? [{ id: ctx.session.user.id }] : [],
          },
        },
      });
    }),

  getLatest: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: featuredImageQuery,
    });

    return posts ?? [];
  }),

  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    if (isNaN(Number(input))) {
      return null;
    }
    return ctx.db.post.findUnique({
      where: { id: Number(input) },
      include: featuredImageQuery,
    });
  }),
});

const featuredImageQuery = {
  featuredUsers: {
    select: {
      id: true,
      image: true,
      name: true,
      reviewsReceived: { select: { rating: true } },
    }, // improve in the future: either make pagination of posts short or save rating avg in user table
  },
};
