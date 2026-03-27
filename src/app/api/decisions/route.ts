import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  const db = getDb();
  const objectiveId = req.nextUrl.searchParams.get("objective_id");
  if (objectiveId) {
    return NextResponse.json(db.prepare("SELECT * FROM decisions WHERE objective_id = ? ORDER BY created_at DESC").all(objectiveId));
  }
  return NextResponse.json(db.prepare("SELECT * FROM decisions ORDER BY created_at DESC").all());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const id = uuid();
  db.prepare(
    "INSERT INTO decisions (id, objective_id, project_id, title, description, decision, rationale, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, body.objective_id || null, body.project_id || null, body.title, body.description || "", body.decision || "", body.rationale || "", body.status || "pending");
  return NextResponse.json(db.prepare("SELECT * FROM decisions WHERE id = ?").get(id), { status: 201 });
}
