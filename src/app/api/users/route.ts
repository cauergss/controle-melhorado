import { readData, writeData } from "@/lib/store";
import { NextRequest, NextResponse } from "next/server";

type User = { id: string; email: string; password: string; name: string; role: string };

// GET - Listar todos os usuários
export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("auth_user")?.value;
  if (!cookie) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const user = JSON.parse(cookie);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const users = await readData<User>("users");
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Erro ao listar usuários" }, { status: 500 });
  }
}

// POST - Criar novo usuário
export async function POST(req: NextRequest) {
  const cookie = req.cookies.get("auth_user")?.value;
  if (!cookie) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const user = JSON.parse(cookie);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
    }

    const users = await readData<User>("users");

    // Verificar se o email já existe
    if (users.some((u) => u.email === email)) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 400 });
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
      role: role || "user",
    };

    users.push(newUser);
    await writeData("users", users);

    return NextResponse.json(newUser, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 });
  }
}

// PUT - Atualizar usuário
export async function PUT(req: NextRequest) {
  const cookie = req.cookies.get("auth_user")?.value;
  if (!cookie) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const user = JSON.parse(cookie);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id, name, email, password, role } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

    const users = await readData<User>("users");
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se o novo email já existe em outro usuário
    if (email && email !== users[userIndex].email && users.some((u) => u.email === email)) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 400 });
    }

    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      email: email || users[userIndex].email,
      password: password || users[userIndex].password,
      role: role || users[userIndex].role,
    };

    await writeData("users", users);

    return NextResponse.json(users[userIndex]);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

// DELETE - Deletar usuário
export async function DELETE(req: NextRequest) {
  const cookie = req.cookies.get("auth_user")?.value;
  if (!cookie) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const user = JSON.parse(cookie);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 });
    }

    // Não permitir deletar o próprio usuário admin
    if (id === user.id) {
      return NextResponse.json({ error: "Você não pode deletar a sua própria conta" }, { status: 400 });
    }

    const users = await readData<User>("users");
    const filteredUsers = users.filter((u) => u.id !== id);

    if (filteredUsers.length === users.length) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    await writeData("users", filteredUsers);

    return NextResponse.json({ message: "Usuário deletado com sucesso" });
  } catch {
    return NextResponse.json({ error: "Erro ao deletar usuário" }, { status: 500 });
  }
}
