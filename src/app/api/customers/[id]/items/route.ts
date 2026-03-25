import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";

type Customer = { id: string; name: string; phone: string; items: { productId: string; quantity: number }[] };
type Product = { id: string; name: string; quantity: number; cost: number };

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const data = await params;
  const customers = await readData<Customer>("customers");
  const customer = customers.find((c) => c.id === data.id);
  if (!customer) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  return NextResponse.json(customer.items ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const data = await params;
  const { productId, quantity } = await req.json();
  if (!productId || !quantity) return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });

  const customers = await readData<Customer>("customers");
  const products = await readData<Product>("products");

  const customerIndex = customers.findIndex((c) => c.id === data.id);
  if (customerIndex === -1) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

  const product = products.find((p) => p.id === productId);
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  const qty = Number(quantity);
  if (qty <= 0 || qty > product.quantity) return NextResponse.json({ error: "Quantidade inválida" }, { status: 400 });

  // Decrementa estoque
  product.quantity -= qty;
  await writeData("products", products);

  const item = customers[customerIndex].items.find((it) => it.productId === productId);
  if (item) {
    item.quantity += qty;
  } else {
    customers[customerIndex].items.push({ productId, quantity: qty });
  }

  await writeData("customers", customers);
  return NextResponse.json(customers[customerIndex]);
}
