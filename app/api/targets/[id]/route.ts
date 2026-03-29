import { NextRequest, NextResponse } from "next/server";

import { deleteTarget, getTarget, updateTarget } from "@/lib/db";
import { targetSchema } from "@/lib/schemas";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const target = getTarget(params.id);
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(target);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = await request.json();
  const parsed = targetSchema.parse({ ...payload, id: params.id });
  return NextResponse.json(updateTarget(params.id, parsed));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  deleteTarget(params.id);
  return NextResponse.json({ ok: true });
}
