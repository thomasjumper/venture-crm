import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  const db = getDb();
  const projectId = req.nextUrl.searchParams.get("project_id");
  if (projectId) {
    const tasks = db.prepare("SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at").all(projectId);
    return NextResponse.json(tasks);
  }
  const tasks = db.prepare(`
    SELECT t.*, p.title as project_title, o.title as objective_title
    FROM tasks t
    LEFT JOIN projects p ON p.id = t.project_id
    LEFT JOIN objectives o ON o.id = p.objective_id
    ORDER BY t.created_at DESC
  `).all();
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const id = uuid();
  db.prepare(
    "INSERT INTO tasks (id, project_id, title, description, status, priority, assigned_to, depends_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, body.project_id, body.title, body.description || "", body.status || "todo", body.priority || "medium", body.assigned_to || null, body.depends_on || null);
  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  return NextResponse.json(task, { status: 201 });
}
