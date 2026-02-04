import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user by email (for login)
export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});

// Get user by ID (for /api/auth/me)
export const getUserById = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Create a new user (for signup)
export const createUser = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        role: v.string(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existingUser) {
            throw new Error("User already exists");
        }

        // Insert new user
        const userId = await ctx.db.insert("users", {
            email: args.email,
            password: args.password,
            role: args.role,
            status: args.status,
        });

        return userId;
    },
});
