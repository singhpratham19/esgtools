import { NextRequest, NextResponse } from "next/server";

import { deleteSupplier, getSupplier, updateSupplier } from "@/lib/db";
import { supplierSchema } from "@/lib/schemas";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supplier = getSupplier(params.id);
  if (!supplier) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(supplier);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = await request.json();
  const parsed = supplierSchema.parse({ ...payload, id: params.id });
  return NextResponse.json(updateSupplier(params.id, parsed));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  deleteSupplier(params.id);
  return NextResponse.json({ ok: true });
}
