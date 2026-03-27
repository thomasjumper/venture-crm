import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const fields = Object.keys(body).filter(k => ["title", "content", "category", "tags"].includes(k));
  if (fields.length === 0) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  const sets = fields.map(f => `${f} = ?`).join(", ");
  const values = fields.map(f => body[f]);
  db.prepare(`UPDATE knowledge SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  return NextResponse.json(db.prepare("SELECT * FROM knowledge WHERE id = ?").get(id));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  getDb().prepare("DELETE FROM knowledge WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
