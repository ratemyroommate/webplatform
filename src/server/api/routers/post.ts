import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { isUserInPostGroup } from "~/utils/helpers";
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

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        description: z.string().min(1).max(200),
        maxPersonCount: z.number().min(2).max(6),
        isResident: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUniqueOrThrow({
        where: { id: input.id },
        include: { featuredUsers: true },
      });

      if (post.createdById !== ctx.session.user.id)
        throw new TRPCError({
          message: "Unauthorized to edit this post",
          code: "UNAUTHORIZED",
        });

      const addResident =
        !isUserInPostGroup(post, ctx.session.user.id) && input.isResident;
      const featuredUsersCount =
        post.featuredUsers.length + Number(addResident);

      if (featuredUsersCount > input.maxPersonCount)
        throw new TRPCError({
          message: "Your group is full, try increasing the group size",
          code: "CONFLICT",
        });

      return ctx.db.post.update({
        where: { id: input.id },
        data: {
          description: input.description,
          maxPersonCount: input.maxPersonCount,
          featuredUsers: input.isResident
            ? { connect: { id: ctx.session.user.id } }
            : { disconnect: { id: ctx.session.user.id } },
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
    const id = Number(input);
    if (isNaN(id)) return null;
    return ctx.db.post.findUnique({
      where: { id },
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
