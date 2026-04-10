import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";
import { verifySession } from "@/lib/auth.server";

type Sale = {
  id: string;
  customerName: string;
  customerPhone: string;
  productId: string;
  productName: string;
  quantity: number;
  paymentMethod: string;
  totalValue: number;
  saleDate: string;
  isFromStock: boolean;
  isPaid: boolean;
};

type Product = { id: string; name: string; quantity: number; cost: number; salePrice: number; image: string; inShowcase: boolean };

function getSession(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  return token ? verifySession(token) : null;
}

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  try {
    const sales = await readData<Sale>("sales");
    return NextResponse.json(sales);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerPhone = typeof body.customerPhone === "string" ? body.customerPhone.trim() : "";
  const productId = typeof body.productId === "string" ? body.productId : "";
  const productName = typeof body.productName === "string" ? body.productName.trim() : "";
  const quantity = Number(body.quantity);
  const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod : "";
  const totalValue = Number(body.totalValue);
  const saleDate = typeof body.saleDate === "string" ? body.saleDate : "";
  const isFromStock = Boolean(body.isFromStock);
  const isPaid = Boolean(body.isPaid ?? true);

  if (!customerName || !customerPhone || !productId || !productName || !quantity || !paymentMethod || !totalValue || !saleDate) {
    return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
  }
  if (quantity <= 0 || totalValue <= 0) {
    return NextResponse.json({ error: "Quantidade e valor devem ser positivos" }, { status: 400 });
  }

  const sales = await readData<Sale>("sales");
  const newSale: Sale = {
    id: Date.now().toString(),
    customerName,
    customerPhone,
    productId,
    productName,
    quantity,
    paymentMethod,
    totalValue,
    saleDate,
    isFromStock,
    isPaid,
  };

  sales.push(newSale);
  await writeData("sales", sales);

  if (isFromStock) {
    try {
      const products = await readData<Product>("products");
      const idx = products.findIndex((p) => p.id === productId);
      if (idx !== -1) {
        products[idx].quantity = Math.max(0, products[idx].quantity - quantity);
        await writeData("products", products);
      }
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
    }
  }

  return NextResponse.json(newSale, { status: 201 });
}
