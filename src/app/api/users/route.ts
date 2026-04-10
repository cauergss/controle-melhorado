import { readData, writeData } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";
import { verifySession, hashPassword } from "@/lib/auth.server";

type User = { id: string; email: string; password: string; name: string; role: string };

function getSession(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  return token ? verifySession(token) : null;
}

// GET - Listar todos os usuários
export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const users = await readData<User>("users");
  // Nunca retornar senhas
  return NextResponse.json(users.map(({ password: _, ...u }) => u));
}

// POST - Criar novo usuário
export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  let name: string, email: string, password: string, role: string;
  try {
    const body = await req.json();
    name = typeof body.name === "string" ? body.name.trim() : "";
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    password = typeof body.password === "string" ? body.password : "";
    role = body.role === "admin" ? "admin" : "user";
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
  }
  if (name.length > 100 || email.length > 255 || password.length > 128) {
    return NextResponse.json({ error: "Campos excedem o tamanho máximo permitido" }, { status: 400 });
  }

  const users = await readData<User>("users");

  if (users.some((u) => u.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 400 });
  }

  const newUser: User = {
    id: `u${Date.now()}`,
    name,
    email,
    password: hashPassword(password), // sempre armazena hash
    role,
  };

  users.push(newUser);
  await writeData("users", users);

  const { password: _, ...safeUser } = newUser;
  return NextResponse.json(safeUser, { status: 201 });
}

// PUT - Atualizar usuário
export async function PUT(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  let id: string, name: string, email: string, password: string, role: string;
  try {
    const body = await req.json();
    id = typeof body.id === "string" ? body.id : "";
    name = typeof body.name === "string" ? body.name.trim() : "";
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    password = typeof body.password === "string" ? body.password : "";
    role = body.role === "admin" ? "admin" : "user";
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  if (!id) return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });

  const users = await readData<User>("users");
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  if (email && email !== users[idx].email && users.some((u) => u.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 400 });
  }

  users[idx] = {
    ...users[idx],
    name: name || users[idx].name,
    email: email || users[idx].email,
    // Só atualiza senha se uma nova foi enviada; faz hash dela
    password: password ? hashPassword(password) : users[idx].password,
    role: role || users[idx].role,
  };

  await writeData("users", users);
  const { password: _, ...safeUser } = users[idx];
  return NextResponse.json(safeUser);
}

// DELETE - Deletar usuário
export async function DELETE(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  let id: string;
  try {
    const body = await req.json();
    id = typeof body.id === "string" ? body.id : "";
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  if (!id) return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });

  if (id === session.id) {
    return NextResponse.json({ error: "Você não pode deletar a sua própria conta" }, { status: 400 });
  }

  const users = await readData<User>("users");
  const filtered = users.filter((u) => u.id !== id);

  if (filtered.length === users.length) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  await writeData("users", filtered);
  return NextResponse.json({ message: "Usuário deletado com sucesso" });
}
