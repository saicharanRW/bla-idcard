import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all people with entry status
export const getAllPeopleWithEntryStatus = query({
    handler: async (ctx) => {
        const people = await ctx.db.query("people_data").order("desc").collect();
        const entries = await ctx.db.query("entered_people").collect();

        // Create a map for quick lookup
        const entryMap = new Map(
            entries.map((e) => [e.qr_data, e.entered_at])
        );

        // Join people with entry status
        return people.map((person) => ({
            ...person,
            id: person._id,
            entered_at: person.qr_data ? entryMap.get(person.qr_data) : null,
        }));
    },
});

// Get person by QR data
export const getPersonByQrData = query({
    args: { qr_data: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("people_data")
            .withIndex("by_qr_data", (q) => q.eq("qr_data", args.qr_data))
            .first();
    },
});

// Insert multiple people records (for CSV upload)
export const insertPeopleData = mutation({
    args: {
        records: v.array(
            v.object({
                party_responsibility: v.optional(v.string()),
                party_district: v.optional(v.string()),
                assembly_constituency: v.optional(v.string()),
                assembly_constituency_number: v.optional(v.string()),
                polling_station_number: v.optional(v.string()),
                bla2_name: v.optional(v.string()),
                file_name: v.optional(v.string()),
                qr_data: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        for (const record of args.records) {
            await ctx.db.insert("people_data", {
                ...record,
                created_at: now,
            });
        }
        return args.records.length;
    },
});
