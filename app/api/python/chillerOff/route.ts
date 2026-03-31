import { NextResponse } from "next/server";
import { turnOffChiller } from "@/lib/pythonRunner";

export async function POST() {
   try {
   await turnOffChiller();
   return NextResponse.json({ success: true });
   } catch (error) {
   return NextResponse.json({ error: String(error) }, { status: 500 });
   }
}