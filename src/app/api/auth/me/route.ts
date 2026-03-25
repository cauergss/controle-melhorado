import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("auth_user")?.value;
  if (!cookie) return NextResponse.json({ authenticated: false }, { status: 401 });

  try {
    const user = JSON.parse(cookie);
    return NextResponse.json({ authenticated: true, user: { ...user, role: user.role || "user" } });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
