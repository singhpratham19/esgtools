import { NextRequest, NextResponse } from "next/server";
import {
  searchEmissionFactors,
  estimate,
  estimateElectricity,
  estimateFuel,
  climatiqEnabled,
} from "@/lib/climatiq";

/**
 * GET /api/climatiq?action=search&query=...
 * POST /api/climatiq { action: "estimate" | "electricity" | "fuel", ... }
 */

export async function GET(request: NextRequest) {
  if (!climatiqEnabled()) {
    return NextResponse.json(
      { error: "CLIMATIQ_API_KEY not configured", configured: false },
      { status: 503 }
    );
  }

  const params = request.nextUrl.searchParams;
  const action = params.get("action") ?? "search";

  if (action === "search") {
    const result = await searchEmissionFactors({
      query: params.get("query") ?? undefined,
      activity_id: params.get("activity_id") ?? undefined,
      category: params.get("category") ?? undefined,
      scope: params.get("scope") ?? undefined,
      sector: params.get("sector") ?? undefined,
      source: params.get("source") ?? undefined,
      year: params.get("year") ? Number(params.get("year")) : undefined,
      region: params.get("region") ?? undefined,
      unit_type: params.get("unit_type") ?? undefined,
      page: params.get("page") ? Number(params.get("page")) : undefined,
      results_per_page: params.get("results_per_page")
        ? Number(params.get("results_per_page"))
        : 10,
    });

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  if (!climatiqEnabled()) {
    return NextResponse.json(
      { error: "CLIMATIQ_API_KEY not configured", configured: false },
      { status: 503 }
    );
  }

  const body = await request.json();
  const action = body.action;

  if (action === "estimate") {
    const result = await estimate({
      activity_id: body.activity_id,
      parameters: body.parameters,
      region: body.region,
      year: body.year,
    });

    if (!result) {
      return NextResponse.json({ error: "Estimation failed" }, { status: 502 });
    }

    return NextResponse.json(result);
  }

  if (action === "electricity") {
    const result = await estimateElectricity({
      region: body.region,
      amount_kwh: body.amount_kwh,
      year: body.year,
    });

    if (!result) {
      return NextResponse.json({ error: "Electricity estimation failed" }, { status: 502 });
    }

    return NextResponse.json(result);
  }

  if (action === "fuel") {
    const result = await estimateFuel({
      fuel_type: body.fuel_type,
      amount: body.amount,
      amount_unit: body.amount_unit,
      region: body.region,
      year: body.year,
    });

    if (!result) {
      return NextResponse.json({ error: "Fuel estimation failed" }, { status: 502 });
    }

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
