import fs from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { createEvidence } from "@/lib/db";
import { createId, timestamp } from "@/lib/server";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const facilityId = String(formData.get("facilityId") || "pune");
  const metric = String(formData.get("metric") || "Uploaded evidence");
  const owner = String(formData.get("owner") || "Unassigned");
  const reviewer = String(formData.get("reviewer") || "Pending");
  const documentType = String(formData.get("documentType") || "Upload");

  await fs.mkdir(uploadsDir, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const savedPath = path.join(uploadsDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(savedPath, buffer);

  const record = createEvidence({
    proofId: createId("proof"),
    facilityId,
    documentName: file.name,
    metric,
    owner,
    reviewer,
    uploadedAt: timestamp(),
    documentType,
    status: "Needs review",
    filePath: `/uploads/${safeName}`
  });

  return NextResponse.json(record, { status: 201 });
}
