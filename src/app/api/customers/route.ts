import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";
import { verifySession } from "@/lib/auth.server";

type Customer = { id: string; name: string; phone: string; items: { productId: string; quantity: number }[] };

function getSession(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  return token ? verifySession(token) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const customers = await readData<Customer>("customers");
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let name: string, phone: string;
  try {
    const body = await req.json();
    name = typeof body.name === "string" ? body.name.trim() : "";
    phone = typeof body.phone === "string" ? body.phone.trim() : "";
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  if (!name || !phone) {
    return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 });
  }
  if (name.length > 100 || phone.length > 30) {
    return NextResponse.json({ error: "Campos excedem o tamanho máximo" }, { status: 400 });
  }

  const customers = await readData<Customer>("customers");
  const newCustomer: Customer = { id: `c${Date.now()}`, name, phone, items: [] };
  customers.push(newCustomer);
  await writeData("customers", customers);
  return NextResponse.json(newCustomer, { status: 201 });
}
