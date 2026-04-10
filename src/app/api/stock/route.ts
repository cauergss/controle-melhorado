import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";
import { verifySession } from "@/lib/auth.server";

type Product = {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  salePrice: number;
  image: string;
  inShowcase: boolean;
};

export async function GET() {
  const products = await readData<Product>("products");
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalInvested = products.reduce((sum, p) => sum + p.quantity * p.cost, 0);
  const totalProfit = products.reduce((sum, p) => sum + p.quantity * (p.salePrice - p.cost), 0);
  return NextResponse.json({ products, totalItems, totalInvested, totalProfit });
}

export async function POST(req: NextRequest) {
  // Apenas usuários autenticados podem cadastrar produtos
  const token = req.cookies.get("auth_session")?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const quantity = Number(body.quantity);
  const cost = Number(body.cost);
  const salePrice = Number(body.salePrice);
  const image = typeof body.image === "string" ? body.image : "";

  if (!name || isNaN(quantity) || quantity < 0 || !cost || !salePrice || !image) {
    return NextResponse.json({ error: "Campos inválidos. Foto é obrigatória." }, { status: 400 });
  }
  if (name.length > 200) {
    return NextResponse.json({ error: "Nome do produto muito longo" }, { status: 400 });
  }

  const products = await readData<Product>("products");
  const newProduct: Product = {
    id: `p${Date.now()}`,
    name,
    quantity,
    cost,
    salePrice,
    image,
    inShowcase: Boolean(body.inShowcase) ?? false,
  };

  products.push(newProduct);
  await writeData("products", products);

  return NextResponse.json(newProduct, { status: 201 });
}
