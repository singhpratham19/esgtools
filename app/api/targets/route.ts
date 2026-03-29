import { NextRequest, NextResponse } from "next/server";

import { createTarget, listTargets } from "@/lib/db";
import { targetSchema } from "@/lib/schemas";
import { createId } from "@/lib/server";

export async function GET() {
  return NextResponse.json(listTargets());
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = targetSchema.parse({
    ...payload,
    id: payload.id || createId("target")
  });
  return NextResponse.json(createTarget(parsed), { status: 201 });
}
