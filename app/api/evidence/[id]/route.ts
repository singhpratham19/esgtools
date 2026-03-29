import { NextRequest, NextResponse } from "next/server";

import { deleteEvidence, getEvidence, updateEvidence } from "@/lib/db";
import { evidenceSchema } from "@/lib/schemas";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const evidence = getEvidence(params.id);
  if (!evidence) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(evidence);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = await request.json();
  const parsed = evidenceSchema.parse({ ...payload, proofId: params.id });
  return NextResponse.json(updateEvidence(params.id, parsed));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  deleteEvidence(params.id);
  return NextResponse.json({ ok: true });
}
