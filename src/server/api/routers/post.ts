import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { formatOrderBy, isUserInPostGroup } from "~/utils/helpers";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { utapi } from "~/app/api/uploadthing/route";

const limit = 2;
const maxPostCountPerUser = 4;
const imagesValidation = z
  .array(
    z.object({
      id: z.string().min(5).max(100),
      url: z.string().min(5).max(100),
    }),
  )
  .max(4);

export const orderBy = z.enum([
  "price-asc",
  "price-desc",
  "createdAt-desc",
  "createdAt-asc",
]);

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        images: imagesValidation,
        price: z.number().min(10).max(999),
        description: z.string().min(1).max(200),
        maxPersonCount: z.number().min(2).max(6),
        isResident: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const postCountPerUser = await ctx.db.post.count({
        where: { createdById: ctx.session.user.id },
      });

      if (postCountPerUser > maxPostCountPerUser) {
        throw new TRPCError({
          message: `Maximum ${maxPostCountPerUser} poszt készíthető felhasználóként jelenleg`,
          code: "UNAUTHORIZED",
        });
      }

      return ctx.db.post.create({
        data: {
          images: { create: input.images },
          price: input.price,
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
        images: imagesValidation,
        price: z.number().min(10).max(999),
        description: z.string().min(1).max(200),
        maxPersonCount: z.number().min(2).max(6),
        isResident: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUniqueOrThrow({
        where: { id: input.id },
        include: { featuredUsers: true, images: true },
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

      const oldImageKeys = post.images.map(({ id }) => id);
      const shouldDeleteOldImages = input.images.length;
      if (shouldDeleteOldImages) await utapi.deleteFiles(oldImageKeys);

      return ctx.db.post.update({
        where: { id: input.id },
        data: {
          images: {
            create: input.images,
            delete: shouldDeleteOldImages ? post.images : [],
          },
          price: input.price,
          description: input.description,
          maxPersonCount: input.maxPersonCount,
          featuredUsers: input.isResident
            ? { connect: { id: ctx.session.user.id } }
            : { disconnect: { id: ctx.session.user.id } },
        },
      });
    }),

  getLatest: publicProcedure
    .input(
      z.object({
        filters: z.object({
          maxPersonCount: z.number().optional(),
          maxPrice: z.number().optional(),
          orderBy: orderBy.default("createdAt-desc"),
        }),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: formatOrderBy(input.filters.orderBy),
        include: featuredImageQuery,
        where: {
          maxPersonCount: input.filters.maxPersonCount || undefined,
          price: { lte: input.filters.maxPrice || undefined },
        },
      });

      const nextCursor = posts.length > limit ? posts.pop()?.id : undefined;
      return { posts, nextCursor };
    }),

  getById: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const id = Number(input);
    if (isNaN(id)) return null;
    return ctx.db.post.findUnique({
      where: { id },
      include: { ...featuredImageQuery, requests: true },
    });
  }),

  getAllByUserId: publicProcedure.input(z.string()).query(({ ctx, input }) =>
    ctx.db.post.findMany({
      where: { createdById: input },
      include: featuredImageQuery,
      orderBy: { createdAt: "desc" },
    }),
  ),

  deleteById: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUniqueOrThrow({
        where: { id: input },
        include: { images: true },
      });

      if (post.createdById !== ctx.session.user.id)
        throw new TRPCError({
          message: "Unauthorized to delete this post",
          code: "UNAUTHORIZED",
        });

      const imageKeys = post.images.map(({ id }) => id);
      await utapi.deleteFiles(imageKeys);
      return ctx.db.post.delete({ where: { id: input } });
    }),
});

const featuredImageQuery = {
  images: true,
  featuredUsers: {
    select: {
      id: true,
      image: true,
      name: true,
      reviewsReceived: { select: { rating: true } },
    }, // improve in the future: either make pagination of posts short or save rating avg in user table
  },
};
