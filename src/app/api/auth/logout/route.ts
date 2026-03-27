import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = req.cookies.get("session")?.value;

  if (session) {
    const db = getDb();
    db.prepare("UPDATE users SET session_token = NULL WHERE session_token = ?").run(session);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
