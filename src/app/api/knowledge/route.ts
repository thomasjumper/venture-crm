import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  const db = getDb();
  const category = req.nextUrl.searchParams.get("category");
  const search = req.nextUrl.searchParams.get("q");
  let query = "SELECT * FROM knowledge";
  const conditions: string[] = [];
  const params: string[] = [];
  if (category) { conditions.push("category = ?"); params.push(category); }
  if (search) { conditions.push("(title LIKE ? OR content LIKE ? OR tags LIKE ?)"); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY created_at DESC";
  return NextResponse.json(db.prepare(query).all(...params));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const id = uuid();
  db.prepare(
    "INSERT INTO knowledge (id, title, content, category, tags, source_objective_id, source_project_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, body.title, body.content, body.category || "general", body.tags || "", body.source_objective_id || null, body.source_project_id || null);
  return NextResponse.json(db.prepare("SELECT * FROM knowledge WHERE id = ?").get(id), { status: 201 });
}
