import { NextRequest, NextResponse } from "next/server";
import { convex } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { qr_data } = await req.json();

        if (!qr_data) {
            return NextResponse.json({ error: "QR data is required" }, { status: 400 });
        }

        try {
            // Mark entry in Convex (will throw if already entered)
            await convex.mutation(api.entries.markEntry, { qr_data });
            return NextResponse.json({ success: true, message: "Entry recorded successfully" });
        } catch (mutationError: unknown) {
            if (mutationError instanceof Error && mutationError.message.includes("User already entered")) {
                return NextResponse.json({ error: "User already entered" }, { status: 400 });
            }
            throw mutationError;
        }

    } catch (error) {
        console.error("Error marking entry:", error);
        return NextResponse.json({ error: "Failed to mark entry" }, { status: 500 });
    }
}
