import { NextRequest, NextResponse } from "next/server";

import { deleteDisclosure, getDisclosure, updateDisclosure } from "@/lib/db";
import { disclosureSchema } from "@/lib/schemas";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const disclosure = getDisclosure(params.id);
  if (!disclosure) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(disclosure);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = await request.json();
  const parsed = disclosureSchema.parse({ ...payload, id: params.id });
  return NextResponse.json(updateDisclosure(params.id, parsed));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  deleteDisclosure(params.id);
  return NextResponse.json({ ok: true });
}
