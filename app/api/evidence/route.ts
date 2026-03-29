import { NextRequest, NextResponse } from "next/server";

import { createEvidence, listEvidence } from "@/lib/db";
import { evidenceSchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  const facilityId = request.nextUrl.searchParams.get("facilityId") ?? undefined;
  return NextResponse.json(listEvidence(facilityId));
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = evidenceSchema.parse(payload);
  return NextResponse.json(createEvidence(parsed), { status: 201 });
}
