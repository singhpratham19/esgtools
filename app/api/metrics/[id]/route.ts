import { NextRequest, NextResponse } from "next/server";

import { deleteMetric, getMetric, updateMetric } from "@/lib/db";
import { metricSchema } from "@/lib/schemas";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const metric = getMetric(params.id);
  if (!metric) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(metric);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = await request.json();
  const parsed = metricSchema.parse({ ...payload, id: params.id });
  return NextResponse.json(updateMetric(params.id, parsed));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  deleteMetric(params.id);
  return NextResponse.json({ ok: true });
}
