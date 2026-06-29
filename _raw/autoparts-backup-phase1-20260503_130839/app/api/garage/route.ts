import { NextRequest, NextResponse } from "next/server";
import { readJson, writeJson, nextId } from "@/lib/fileStore";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";

export interface Vehicle {
  id: string;
  userId: string;
  nickname: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color: string;
  nextService: string;
  lastOilChange: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  createdAt: string;
}

const FILE = "garage.json";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  const vehicles = readJson<Vehicle[]>(FILE);

  // Admin sees all; users see only their own
  if (!user) return NextResponse.json([], { status: 200 });
  if (user.role === "admin") return NextResponse.json(vehicles);
  return NextResponse.json(vehicles.filter((v) => v.userId === user.id));
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const vehicle: Vehicle = {
    id: nextId("v"),
    userId: user.id,
    nickname: body.nickname || `${body.brand} ${body.model}`,
    brand: body.brand ?? "",
    model: body.model ?? "",
    year: Number(body.year) || new Date().getFullYear(),
    licensePlate: body.licensePlate ?? "",
    vin: body.vin,
    color: body.color ?? "",
    nextService: body.nextService ?? "—",
    lastOilChange: body.lastOilChange ?? "—",
    mileage: Number(body.mileage) || 0,
    fuelType: body.fuelType ?? "Xăng",
    transmission: body.transmission ?? "Số tự động",
    createdAt: new Date().toISOString(),
  };

  const vehicles = readJson<Vehicle[]>(FILE);
  vehicles.push(vehicle);
  writeJson(FILE, vehicles);

  return NextResponse.json(vehicle, { status: 201 });
}
