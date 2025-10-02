import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPet = mutation({
  args: {
    ownerId: v.id("users"),
    name: v.string(),
    type: v.string(),
    breed: v.string(),
    age: v.number(),
    size: v.string(),
    gender: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    activityLevel: v.string(),
    goodWithKids: v.boolean(),
    goodWithPets: v.boolean(),
    isHouseTrained: v.boolean(),
    medicalInfo: v.optional(v.string()),
    adoptionFee: v.optional(v.number()),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pets", {
      ...args,
      isAvailable: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getAllPets = query({
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pets")
      .withIndex("by_availability", (q) => q.eq("isAvailable", true))
      .collect();
  },
});

export const getFilteredPets = query({
  args: {
    searchTerm: v.string(),
    filters: v.object({
      type: v.string(),
      breed: v.string(),
      size: v.string(),
      age: v.string(),
      gender: v.string(),
      activityLevel: v.string(),
      goodWithKids: v.string(),
      goodWithPets: v.string(),
      location: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    let pets = await ctx.db
      .query("pets")
      .withIndex("by_availability", (q) => q.eq("isAvailable", true))
      .collect();

    // Apply search term
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();

      pets = pets.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchLower) ||
          pet.breed.toLowerCase().includes(searchLower) ||
          pet.description.toLowerCase().includes(searchLower) ||
          pet.type.toLowerCase().includes(searchLower),
      );
    }

    // Apply filters
    const { filters } = args;

    if (filters.type) {
      pets = pets.filter((pet) => pet.type === filters.type);
    }

    if (filters.size) {
      pets = pets.filter((pet) => pet.size === filters.size);
    }

    if (filters.gender) {
      pets = pets.filter((pet) => pet.gender === filters.gender);
    }

    if (filters.activityLevel) {
      pets = pets.filter((pet) => pet.activityLevel === filters.activityLevel);
    }

    if (filters.goodWithKids) {
      const value = filters.goodWithKids === "true";
      pets = pets.filter((pet) => pet.goodWithKids === value);
    }

    if (filters.goodWithPets) {
      const value = filters.goodWithPets === "true";
      pets = pets.filter((pet) => pet.goodWithPets === value);
    }

    if (filters.location) {
      pets = pets.filter((pet) =>
        pet.location.toLowerCase().includes(filters.location.toLowerCase()),
      );
    }

    if (filters.age) {
      pets = pets.filter((pet) => {
        switch (filters.age) {
          case "young":
            return pet.age <= 2;
          case "adult":
            return pet.age >= 3 && pet.age <= 7;
          case "senior":
            return pet.age >= 8;
          default:
            return true;
        }
      });
    }

    return pets;
  },
});

export const getRecommendedPets = query({
  args: {
    userId: v.id("users"),
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
    let pets = await ctx.db
      .query("pets")
      .withIndex("by_availability", (q) => q.eq("isAvailable", true))
      .collect();

    // filter out pets owned by the user
    pets = pets.filter((pet) => pet.ownerId !== args.userId);

    // If no preferences, return all available pets
    if (!args.preferences) {
      return pets.slice(0, 12);
    }

    const { petType, size, age, activityLevel } = args.preferences;

    if (petType && petType.length > 0) {
      pets = pets.filter((pet) => petType.includes(pet.type));
    }

    if (size && size.length > 0) {
      pets = pets.filter((pet) => size.includes(pet.type));
    }

    if (activityLevel) {
      pets = pets.filter((pet) => pet.activityLevel === activityLevel);
    }

    if (age && age.length > 0) {
      pets = pets.filter((pet) => {
        return age.some((ageRange) => {
          switch (ageRange) {
            case "young":
              return pet.age <= 2;
            case "adult":
              return pet.age >= 3 && pet.age <= 7;
            case "senior":
              return pet.age >= 8;
            default:
              return true;
          }
        });
      });
    }

    // If no preferences, return random pets
    if (pets.length === 0) {
      pets = await ctx.db
        .query("pets")
        .withIndex("by_availability", (q) => q.eq("isAvailable", true))
        .collect();
      pets = pets.filter((pet) => pet.ownerId !== args.userId);
    }

    return pets.slice(0, 12);
  },
});

export const getPetsByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pets")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

export const getPetById = query({
  args: { id: v.id("pets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updatePet = mutation({
  args: {
    id: v.id("pets"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    breed: v.optional(v.string()),
    age: v.optional(v.number()),
    size: v.optional(v.string()),
    gender: v.optional(v.string()),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    isAvailable: v.optional(v.boolean()),
    activityLevel: v.optional(v.string()),
    goodWithKids: v.optional(v.boolean()),
    goodWithPets: v.optional(v.boolean()),
    isHouseTrained: v.optional(v.boolean()),
    location: v.optional(v.string()),
    medicalInfo: v.optional(v.string()),
    adoptionFee: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

export const deletePet = mutation({
  args: { id: v.id("pets") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
