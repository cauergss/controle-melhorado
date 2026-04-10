import { readData, writeData } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, isLegacyPassword, hashPassword, signSession } from "@/lib/auth.server";
import { checkRateLimit } from "@/lib/rateLimit";

type User = { id: string; email: string; password: string; name: string; role: string };

export async function POST(req: NextRequest) {
  // Rate limiting por IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = checkRateLimit(`login:${ip}`);
  if (!rl.allowed) {
    const retrySecs = Math.ceil((rl.retryAfterMs ?? 0) / 1000);
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(retrySecs) } }
    );
  }

  // Validação básica do body
  let email: string, password: string;
  try {
    const body = await req.json();
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  if (!email || !password || email.length > 255 || password.length > 128) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const users = await readData<User>("users");
  const user = users.find((u) => u.email.toLowerCase() === email);

  // Resposta genérica para não vazar se o email existe
  if (!user || !verifyPassword(password, user.password)) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  // Migração transparente de senha em texto plano → hash seguro
  if (isLegacyPassword(user.password)) {
    const idx = users.findIndex((u) => u.id === user.id);
    users[idx].password = hashPassword(password);
    await writeData("users", users);
    console.log(`✓ Senha do usuário ${user.email} migrada para hash seguro`);
  }

  // Cria sessão assinada com HMAC
  const token = signSession({ id: user.id, email: user.email, name: user.name, role: user.role });

  const isProduction = process.env.NODE_ENV === "production";

  const res = NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  res.cookies.set({
    name: "auth_session",
    value: token,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 8 * 60 * 60, // 8 horas em segundos
  });

  return res;
}
