import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendMessage = mutation({
  args: {
    applicationId: v.id("adoptionApplications"),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getMessagesByApplication = query({
  args: { applicationId: v.id("adoptionApplications") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", args.applicationId),
      )
      .order("asc")
      .collect();
  },
});
