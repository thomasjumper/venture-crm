import { NextRequest, NextResponse } from "next/server";
import getDb, { hashPassword, randomUUID } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const db = getDb();
    const passwordHash = hashPassword(password);

    const user = db.prepare(
      "SELECT id, username, display_name FROM users WHERE username = ? AND password_hash = ?"
    ).get(username, passwordHash) as { id: string; username: string; display_name: string } | undefined;

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionToken = randomUUID();
    db.prepare("UPDATE users SET session_token = ? WHERE id = ?").run(sessionToken, user.id);

    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      display_name: user.display_name,
    });

    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
