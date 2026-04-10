import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";

type Product = { id: string; name: string; quantity: number; cost: number; salePrice: number; image: string; inShowcase: boolean };

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (!body.name || body.quantity === undefined || body.quantity === null || !body.cost || !body.salePrice || !body.image) {
    return NextResponse.json({ error: "Campos inválidos" }, { status: 400 });
  }

  const products = await readData<Product>("products");
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const updatedProduct: Product = {
    id,
    name: body.name,
    quantity: Number(body.quantity),
    cost: Number(body.cost),
    salePrice: Number(body.salePrice),
    image: body.image,
    inShowcase: body.inShowcase ?? false,
  };

  products[productIndex] = updatedProduct;
  await writeData("products", products);

  return NextResponse.json(updatedProduct);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const products = await readData<Product>("products");
  const productIndex = products.findIndex((p) => p.id === id);

  if (productIndex === -1) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const deletedProduct = products[productIndex];
  products.splice(productIndex, 1);
  await writeData("products", products);

  return NextResponse.json({ message: "Produto deletado com sucesso", product: deletedProduct });
}