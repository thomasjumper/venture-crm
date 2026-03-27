import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const objective = db.prepare("SELECT * FROM objectives WHERE id = ?").get(id);
  if (!objective) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const projects = db.prepare("SELECT * FROM projects WHERE objective_id = ? ORDER BY created_at").all(id);
  const decisions = db.prepare("SELECT * FROM decisions WHERE objective_id = ? ORDER BY created_at DESC").all(id);
  return NextResponse.json({ ...objective as Record<string, unknown>, projects, decisions });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const fields = Object.keys(body).filter(k => ["title", "description", "status", "priority"].includes(k));
  if (fields.length === 0) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  const sets = fields.map(f => `${f} = ?`).join(", ");
  const values = fields.map(f => body[f]);
  db.prepare(`UPDATE objectives SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  const objective = db.prepare("SELECT * FROM objectives WHERE id = ?").get(id);
  return NextResponse.json(objective);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM objectives WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
