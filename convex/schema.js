import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  pets: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    type: v.string(),
    breed: v.string(),
    age: v.number(),
    size: v.string(),
    gender: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    isAvailable: v.boolean(),
    activityLevel: v.string(),
    goodWithKids: v.boolean(),
    goodWithPets: v.boolean(),
    isHouseTrained: v.boolean(),
    medicalInfo: v.optional(v.string()),
    adoptionFee: v.optional(v.number()),
    location: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_type", ["type"])
    .index("by_availability", ["isAvailable"]),

  adoptionApplications: defineTable({
    petId: v.id("pets"),
    applicantId: v.id("users"),
    ownerId: v.id("users"),
    status: v.string(),
    applicationData: v.object({
      experience: v.string(),
      livingSpace: v.string(),
      workSchedule: v.string(),
      otherPets: v.string(),
      reason: v.string(),
      references: v.optional(v.string()),
      additionalInfo: v.optional(v.string()),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_pet", ["petId"])
    .index("by_applicant", ["applicantId"])
    .index("by_owner", ["ownerId"]),

  messages: defineTable({
    applicationId: v.id("adoptionApplications"),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_application", ["applicationId"])
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_read_status", ["userId", "isRead"]),
});
