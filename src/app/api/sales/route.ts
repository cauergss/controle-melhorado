import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const salesFile = path.join(process.cwd(), "src", "data", "sales.json");

function readSales(): any[] {
  if (!fs.existsSync(salesFile)) return [];
  return JSON.parse(fs.readFileSync(salesFile, "utf-8"));
}

function writeSales(sales: any[]) {
  fs.writeFileSync(salesFile, JSON.stringify(sales, null, 2));
}

export async function GET() {
  const sales = readSales();
  return NextResponse.json(sales);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { customerName, customerPhone, productId, productName, quantity, paymentMethod, totalValue, saleDate, isFromStock, isPaid } = body;

  if (!customerName || !customerPhone || !productId || !productName || !quantity || !paymentMethod || !totalValue || !saleDate) {
    return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
  }

  const sales = readSales();
  const newSale = {
    id: Date.now().toString(),
    customerName,
    customerPhone,
    productId,
    productName,
    quantity: Number(quantity),
    paymentMethod,
    totalValue: Number(totalValue),
    saleDate,
    isFromStock: Boolean(isFromStock),
    isPaid: Boolean(isPaid ?? true),
  };

  sales.push(newSale);
  writeSales(sales);

  // Se é do estoque, reduzir quantidade
  if (isFromStock) {
    const stockFile = path.join(process.cwd(), "src", "data", "products.json");
    if (fs.existsSync(stockFile)) {
      const products = JSON.parse(fs.readFileSync(stockFile, "utf-8"));
      const productIndex = products.findIndex((p: any) => p.id === productId);
      if (productIndex !== -1) {
        products[productIndex].quantity -= Number(quantity);
        fs.writeFileSync(stockFile, JSON.stringify(products, null, 2));
      }
    }
  }

  return NextResponse.json(newSale);
}