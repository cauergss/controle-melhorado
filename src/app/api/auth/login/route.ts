import { readData } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const users = await readData<{ id: string; email: string; password: string; name: string; role: string }>("users");
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });

  const res = NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  res.cookies.set({ name: "auth_user", value: JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role }), path: "/", httpOnly: true });
  return res;
}
