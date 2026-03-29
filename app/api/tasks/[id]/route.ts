import { NextRequest, NextResponse } from "next/server";

import { deleteTask, getTask, updateTask } from "@/lib/db";
import { taskSchema } from "@/lib/schemas";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const task = getTask(params.id);
  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const payload = await request.json();
  const parsed = taskSchema.parse({ ...payload, id: params.id });
  return NextResponse.json(updateTask(params.id, parsed));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  deleteTask(params.id);
  return NextResponse.json({ ok: true });
}
