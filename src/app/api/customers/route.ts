import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";

export async function GET() {
  const customers = await readData<{ id: string; name: string; phone: string; items: { productId: string; quantity: number }[] }>("customers");
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const { name, phone } = await req.json();
  if (!name || !phone) return NextResponse.json({ error: "Nome e telefone obrigatórios" }, { status: 400 });

  const customers = await readData("customers");
  const newCustomer = { id: `c${Date.now()}`, name, phone, items: [] };
  customers.push(newCustomer);
  await writeData("customers", customers);
  return NextResponse.json(newCustomer, { status: 201 });
}
