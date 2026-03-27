import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const fields = Object.keys(body).filter(k => ["title", "description", "decision", "rationale", "status"].includes(k));
  if (fields.length === 0) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  const sets = fields.map(f => `${f} = ?`).join(", ");
  const values = fields.map(f => body[f]);
  db.prepare(`UPDATE decisions SET ${sets} WHERE id = ?`).run(...values, id);
  return NextResponse.json(db.prepare("SELECT * FROM decisions WHERE id = ?").get(id));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  getDb().prepare("DELETE FROM decisions WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
