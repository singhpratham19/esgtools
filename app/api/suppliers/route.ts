import { NextRequest, NextResponse } from "next/server";

import { createSupplier, listSuppliers } from "@/lib/db";
import { supplierSchema } from "@/lib/schemas";
import { createId } from "@/lib/server";

export async function GET() {
  return NextResponse.json(listSuppliers());
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = supplierSchema.parse({
    ...payload,
    id: payload.id || createId("supplier")
  });
  return NextResponse.json(createSupplier(parsed), { status: 201 });
}
