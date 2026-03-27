import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const fields = Object.keys(body).filter(k => ["title", "description", "status", "priority", "assigned_to", "depends_on"].includes(k));
  if (fields.length === 0) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  const sets = fields.map(f => `${f} = ?`).join(", ");
  const values = fields.map(f => body[f]);
  db.prepare(`UPDATE tasks SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
