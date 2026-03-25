import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";

type Product = { id: string; name: string; quantity: number; cost: number; image: string };

export async function GET() {
  const products = await readData<Product>("products");
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalCost = products.reduce((sum, p) => sum + p.quantity * p.cost, 0);
  return NextResponse.json({ products, totalItems, totalCost });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.quantity || !body.cost || !body.image) {
    return NextResponse.json({ error: "Campos inválidos. Foto é obrigatória." }, { status: 400 });
  }

  const products = await readData<Product>("products");
  const newProduct: Product = {
    id: `p${Date.now()}`,
    name: body.name,
    quantity: Number(body.quantity),
    cost: Number(body.cost),
    image: body.image,
  };

  products.push(newProduct);
  await writeData("products", products);

  return NextResponse.json(newProduct, { status: 201 });
}
