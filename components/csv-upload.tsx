"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export function CsvUpload() {
    const [isUploading, setIsUploading] = useState(false);

    async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
            toast.error("Please upload a valid .csv or .xlsx file");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload-csv", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Upload failed");
            }

            toast.success(`Successfully uploaded ${result.count} records!`);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to upload file");
        } finally {
            setIsUploading(false);
            // Reset input
            event.target.value = "";
        }
    }

    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            {/* <div className="grid w-full max-w-sm items-center gap-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Upload Data (CSV/Excel)</span>
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="cursor-pointer"
                />
            </div> */}
        </div>
    );
}
