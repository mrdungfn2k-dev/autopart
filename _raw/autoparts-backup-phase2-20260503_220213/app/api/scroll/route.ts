import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  return NextResponse.json({ scrollY: null });
}

export async function POST(req: Request) {
  return NextResponse.json({ success: true });
}
