import { NextRequest, NextResponse } from "next/server";

import { createDisclosure, listDisclosures } from "@/lib/db";
import { disclosureSchema } from "@/lib/schemas";
import { createId } from "@/lib/server";

export async function GET() {
  return NextResponse.json(listDisclosures());
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = disclosureSchema.parse({
    ...payload,
    id: payload.id || createId("disclosure")
  });
  return NextResponse.json(createDisclosure(parsed), { status: 201 });
}
