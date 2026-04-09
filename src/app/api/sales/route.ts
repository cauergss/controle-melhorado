import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";

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
<<<<<<< HEAD

type Product = { id: string; name: string; quantity: number; cost: number; salePrice: number; image: string; inShowcase: boolean };
=======
>>>>>>> c62cf76f8d4077df9d1033d9117a1b7a2f0e39f6

export async function GET() {
  try {
    const sales = await readData<Sale>("sales");
    return NextResponse.json(sales);
<<<<<<< HEAD
  } catch {
    return NextResponse.json([], { status: 200 });
=======
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json({ error: "Erro ao buscar vendas" }, { status: 500 });
>>>>>>> c62cf76f8d4077df9d1033d9117a1b7a2f0e39f6
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, productId, productName, quantity, paymentMethod, totalValue, saleDate, isFromStock, isPaid } = body;

    if (!customerName || !customerPhone || !productId || !productName || !quantity || !paymentMethod || !totalValue || !saleDate) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }

    const sales = await readData<Sale>("sales");
    const newSale: Sale = {
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
    await writeData("sales", sales);

    // Se é do estoque, reduzir quantidade
    if (isFromStock) {
      try {
<<<<<<< HEAD
        const products = await readData<Product>("products");
        const productIndex = products.findIndex((p) => p.id === productId);
        if (productIndex !== -1) {
          products[productIndex].quantity = Math.max(0, products[productIndex].quantity - Number(quantity));
          await writeData("products", products);
        }
      } catch (stockErr) {
        console.error("Erro ao atualizar estoque:", stockErr);
        // Venda foi registrada com sucesso; apenas o estoque não atualizou
      }
    }

    return NextResponse.json(newSale);
  } catch (err) {
    console.error("Erro ao registrar venda:", err);
    return NextResponse.json({ error: "Erro interno ao registrar venda" }, { status: 500 });
=======
        const products = await readData<{ id: string; name: string; quantity: number; cost: number; image: string }>("products");
        const productIndex = products.findIndex((p) => p.id === productId);
        if (productIndex !== -1) {
          products[productIndex].quantity -= Number(quantity);
          await writeData("products", products);
        }
      } catch (error) {
        console.error("Erro ao atualizar estoque:", error);
      }
    }

    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return NextResponse.json({ error: "Erro ao criar venda" }, { status: 500 });
>>>>>>> c62cf76f8d4077df9d1033d9117a1b7a2f0e39f6
  }
}