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

function getSession(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  return token ? verifySession(token) : null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;

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
    return NextResponse.json({ error: "Campos inválidos" }, { status: 400 });
  }

  const products = await readData<Product>("products");
  const idx = products.findIndex((p) => p.id === id);

  if (idx === -1) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  products[idx] = {
    id,
    name,
    quantity,
    cost,
    salePrice,
    image,
    inShowcase: Boolean(body.inShowcase) ?? false,
  };

  await writeData("products", products);
  return NextResponse.json(products[idx]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await params;

  const products = await readData<Product>("products");
  const idx = products.findIndex((p) => p.id === id);

  if (idx === -1) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

  const deleted = products.splice(idx, 1)[0];
  await writeData("products", products);

  return NextResponse.json({ message: "Produto deletado com sucesso", product: deleted });
}
