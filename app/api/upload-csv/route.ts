import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { convex } from "@/lib/convex";
import { api } from "@/convex/_generated/api";

// Force Node.js runtime for file handling
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        let records: string[][] = [];

        // Basic file type detection by extension
        if (file.name.endsWith(".csv")) {
            const text = await file.text();
            const result = Papa.parse(text, {
                header: false,
                skipEmptyLines: true,
            });
            records = result.data as string[][];
        } else if (file.name.endsWith(".xlsx")) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const workbook = XLSX.read(buffer, { type: "buffer" });

            // Assume data is in the first sheet
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convert to array of arrays
            records = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
        } else {
            return NextResponse.json({ error: "Invalid file type. Only .csv and .xlsx are supported." }, { status: 400 });
        }

        if (!records || records.length === 0) {
            return NextResponse.json({ error: "File is empty" }, { status: 400 });
        }

        // Skip header row if it exists (assuming first row is header)
        const rowsToInsert = records.slice(1);

        // Helper to safely get string value
        const getValue = (row: string[], idx: number): string | undefined => {
            const val = row[idx];
            return val !== undefined && val !== null ? String(val).trim() || undefined : undefined;
        };

        // Prepare records for Convex
        const convexRecords = rowsToInsert
            .filter(row => row && row.length > 0)
            .map(row => ({
                party_responsibility: getValue(row, 0),
                party_district: getValue(row, 1),
                assembly_constituency: getValue(row, 2),
                assembly_constituency_number: getValue(row, 3),
                polling_station_number: getValue(row, 4),
                bla2_name: getValue(row, 5),
                file_name: getValue(row, 6),
                qr_data: getValue(row, 7),
            }));

        // Insert all records in Convex
        const count = await convex.mutation(api.people.insertPeopleData, {
            records: convexRecords
        });

        return NextResponse.json({ success: true, count });

    } catch (error) {
        console.error("Upload processing error:", error);
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}
