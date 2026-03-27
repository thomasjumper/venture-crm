import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET() {
  const db = getDb();
  const objectives = db.prepare(`
    SELECT o.*,
      (SELECT COUNT(*) FROM projects WHERE objective_id = o.id) as project_count,
      (SELECT COUNT(*) FROM projects p JOIN tasks t ON t.project_id = p.id WHERE p.objective_id = o.id) as task_count,
      (SELECT COUNT(*) FROM projects p JOIN tasks t ON t.project_id = p.id WHERE p.objective_id = o.id AND t.status = 'done') as tasks_done
    FROM objectives o ORDER BY o.created_at DESC
  `).all();
  return NextResponse.json(objectives);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const id = uuid();
  db.prepare(
    "INSERT INTO objectives (id, title, description, status, priority) VALUES (?, ?, ?, ?, ?)"
  ).run(id, body.title, body.description || "", body.status || "draft", body.priority || "medium");
  const objective = db.prepare("SELECT * FROM objectives WHERE id = ?").get(id);
  return NextResponse.json(objective, { status: 201 });
}
