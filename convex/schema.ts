import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        email: v.string(),
        password: v.string(),
        role: v.string(),
        status: v.string(),
    }).index("by_email", ["email"]),

    people_data: defineTable({
        party_responsibility: v.optional(v.string()),
        party_district: v.optional(v.string()),
        assembly_constituency: v.optional(v.string()),
        assembly_constituency_number: v.optional(v.string()),
        polling_station_number: v.optional(v.string()),
        bla2_name: v.optional(v.string()),
        file_name: v.optional(v.string()),
        qr_data: v.optional(v.string()),
        created_at: v.optional(v.number()),
    }).index("by_qr_data", ["qr_data"]),

    entered_people: defineTable({
        qr_data: v.string(),
        entered_at: v.number(),
    }).index("by_qr_data", ["qr_data"]),
});
