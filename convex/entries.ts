import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check if person has already entered
export const checkEntry = query({
    args: { qr_data: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("entered_people")
            .withIndex("by_qr_data", (q) => q.eq("qr_data", args.qr_data))
            .first();
    },
});

// Mark person as entered
export const markEntry = mutation({
    args: { qr_data: v.string() },
    handler: async (ctx, args) => {
        // Check if already entered
        const existingEntry = await ctx.db
            .query("entered_people")
            .withIndex("by_qr_data", (q) => q.eq("qr_data", args.qr_data))
            .first();

        if (existingEntry) {
            throw new Error("User already entered");
        }

        // Insert entry record with current time
        await ctx.db.insert("entered_people", {
            qr_data: args.qr_data,
            entered_at: Date.now(),
        });

        return { success: true };
    },
});
