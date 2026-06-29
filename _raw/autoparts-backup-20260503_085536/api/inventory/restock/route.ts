import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import type { Product } from "@/lib/api";

const PROD_FILE = "products.json";
const RECEIPT_FILE = "goods-receipts.json";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, qty, source, price } = body;
    
    if (!productId || !qty) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update Product Stock
    const products = readJson<Product[]>(PROD_FILE);
    const idx = products.findIndex(p => p.id === productId);
    if (idx < 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newStock = (products[idx].stock || 0) + Number(qty);
    products[idx].stock = newStock;
    writeJson(PROD_FILE, products);

    // Log Receipt History
    const receipts = readJson<any[]>(RECEIPT_FILE);
    const newReceipt = {
      id: "GR-" + Date.now(),
      productId,
      productName: products[idx].name,
      qty: Number(qty),
      source: source || "Nguồn nội bộ",
      price: Number(price) || 0,
      totalValue: Number(qty) * (Number(price) || 0),
      date: new Date().toISOString()
    };
    
    receipts.push(newReceipt);
    writeJson(RECEIPT_FILE, receipts);

    return NextResponse.json({ success: true, stock: newStock, receipt: newReceipt });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
