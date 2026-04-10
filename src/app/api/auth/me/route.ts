import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth.server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const session = verifySession(token);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role ?? "user",
    },
  });
}
