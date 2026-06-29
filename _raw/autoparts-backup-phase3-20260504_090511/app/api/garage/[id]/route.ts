import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";
import type { Vehicle } from "../route";

const FILE = "garage.json";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const vehicles = readJson<Vehicle[]>(FILE);
  const idx = vehicles.findIndex((v) => v.id === params.id && (v.userId === user.id || user.role === "admin"));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  vehicles[idx] = { ...vehicles[idx], ...body, id: params.id };
  writeJson(FILE, vehicles);
  return NextResponse.json(vehicles[idx]);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vehicles = readJson<Vehicle[]>(FILE);
  const idx = vehicles.findIndex((v) => v.id === params.id && (v.userId === user.id || user.role === "admin"));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deleted = vehicles.splice(idx, 1)[0];
  writeJson(FILE, vehicles);
  return NextResponse.json(deleted);
}
