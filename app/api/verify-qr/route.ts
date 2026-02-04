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

        // 1. Check if person exists in people_data
        const person = await convex.query(api.people.getPersonByQrData, { qr_data });

        if (!person) {
            return NextResponse.json({ status: "not_found", message: "Guest not found in database." });
        }

        // 2. Check if already entered
        const entry = await convex.query(api.entries.checkEntry, { qr_data });

        if (entry) {
            const entryTime = new Date(entry.entered_at).toLocaleString();
            return NextResponse.json({
                status: "already_entered",
                message: `Already entered at ${entryTime}`,
                person: { ...person, id: person._id }
            });
        }

        // 3. Allowed to enter
        return NextResponse.json({
            status: "allowed",
            message: "Access Granted",
            person: { ...person, id: person._id }
        });

    } catch (error) {
        console.error("Error verifying QR:", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
