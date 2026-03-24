import { NextResponse } from "next/server";
import { getStatus } from "@/lib/pythonRunner";

export async function GET() {
  return NextResponse.json(getStatus());
}