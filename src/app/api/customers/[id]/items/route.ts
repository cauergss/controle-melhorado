import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";
import { verifySession } from "@/lib/auth.server";

type Customer = { id: string; name: string; phone: string; items: { productId: string; quantity: number }[] };
type Product = { id: string; name: string; quantity: number; cost: number };

function getSession(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  return token ? verifySession(token) : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;
  const customers = await readData<Customer>("customers");
  const customer = customers.find((c) => c.id === id);
  if (!customer) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  return NextResponse.json(customer.items ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;

  let productId: string, quantity: number;
  try {
    const body = await req.json();
    productId = typeof body.productId === "string" ? body.productId : "";
    quantity = Number(body.quantity);
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  if (!productId || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "Campos obrigatórios inválidos" }, { status: 400 });
  }

  const customers = await readData<Customer>("customers");
  const products = await readData<Product>("products");

  const customerIndex = customers.findIndex((c) => c.id === id);
  if (customerIndex === -1) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

  const product = products.find((p) => p.id === productId);
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  if (quantity > product.quantity) {
    return NextResponse.json({ error: "Quantidade inválida ou insuficiente no estoque" }, { status: 400 });
  }

  // Decrementa estoque
  product.quantity -= quantity;
  await writeData("products", products);

  const item = customers[customerIndex].items.find((it) => it.productId === productId);
  if (item) {
    item.quantity += quantity;
  } else {
    customers[customerIndex].items.push({ productId, quantity });
  }

  await writeData("customers", customers);
  return NextResponse.json(customers[customerIndex]);
}
