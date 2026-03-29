import { NextRequest, NextResponse } from "next/server";

import { createMetric, listMetrics } from "@/lib/db";
import { metricSchema } from "@/lib/schemas";
import { createId } from "@/lib/server";

export async function GET(request: NextRequest) {
  const facilityId = request.nextUrl.searchParams.get("facilityId") ?? undefined;
  return NextResponse.json(listMetrics(facilityId));
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = metricSchema.parse({
    ...payload,
    id: payload.id || createId("metric")
  });

  return NextResponse.json(createMetric(parsed), { status: 201 });
}
