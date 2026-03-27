import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET(req: NextRequest) {
  const db = getDb();
  const objectiveId = req.nextUrl.searchParams.get("objective_id");
  if (objectiveId) {
    const projects = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as tasks_done
      FROM projects p WHERE p.objective_id = ? ORDER BY p.created_at
    `).all(objectiveId);
    return NextResponse.json(projects);
  }
  const projects = db.prepare(`
    SELECT p.*, o.title as objective_title,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'done') as tasks_done
    FROM projects p LEFT JOIN objectives o ON o.id = p.objective_id ORDER BY p.created_at DESC
  `).all();
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = getDb();
  const id = uuid();
  db.prepare(
    "INSERT INTO projects (id, objective_id, title, description, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, body.objective_id, body.title, body.description || "", body.status || "planned", body.assigned_to || null);
  const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
  return NextResponse.json(project, { status: 201 });
}
