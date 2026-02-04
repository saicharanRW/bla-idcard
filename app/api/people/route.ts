import { NextResponse } from "next/server";
import { convex } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

export async function GET() {
    try {
        // Get all people with entry status from Convex
        const data = await convex.query(api.people.getAllPeopleWithEntryStatus);

        // Format entered_at as ISO string for consistency
        const formattedData = data.map((person) => ({
            ...person,
            entered_at: person.entered_at
                ? new Date(person.entered_at).toISOString()
                : null,
        }));

        return NextResponse.json({ data: formattedData });
    } catch (error) {
        console.error("Error fetching people data:", error);
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
