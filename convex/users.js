import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const exisitingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (exisitingUser) {
      return exisitingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    profileImage: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    phone: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        petType: v.optional(v.array(v.string())),
        size: v.optional(v.array(v.string())),
        age: v.optional(v.array(v.string())),
        activityLevel: v.optional(v.string()),
        livingSpace: v.optional(v.string()),
        experience: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    // Delete user's pets
    const userPets = await ctx.db
      .query("pets")
      .withIndex("by_owner", (q) => q.q("ownerId", args.id))
      .collect();

    for (const pet of userPets) {
      await ctx.db.delete(pet._id);
    }

    // Delete user's applications
    const userApplications = await ctx.db
      .query("adoptionApplications")
      .withIndex("by_applicant", (q) => q.eq("applicantId", args.id))
      .collect();

    for (const application of userApplications) {
      await ctx.db.delete(application._id);
    }

    // Delete applications for user's pets
    const ownerApplications = await ctx.db
      .query("adoptionApplications")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.id))
      .collect();

    for (const application of ownerApplications) {
      await ctx.db.delete(application._id);
    }

    // Delete user messages
    const userMessages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", args.id))
      .collect();

    for (const message of userMessages) {
      await ctx.db.delete(message._id);
    }

    // Delete message sent to the user
    const receivedMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", args.id))
      .collect();

    for (const message of receivedMessages) {
      await ctx.db.delete(message._id);
    }

    // Delete user's notifications
    const userNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.id))
      .collect();

    for (const notification of userNotifications) {
      await ctx.db.delete(notification._id);
    }

    // Delete the user
    return await ctx.db.delete(args.id);
  },
});
