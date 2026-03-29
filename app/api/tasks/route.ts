import { NextRequest, NextResponse } from "next/server";

import { createTask, listTasks } from "@/lib/db";
import { taskSchema } from "@/lib/schemas";
import { createId } from "@/lib/server";

export async function GET() {
  return NextResponse.json(listTasks());
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = taskSchema.parse({
    ...payload,
    id: payload.id || createId("task")
  });
  return NextResponse.json(createTask(parsed), { status: 201 });
}
