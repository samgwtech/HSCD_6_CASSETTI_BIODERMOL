import { NextResponse } from "next/server";
import { setChiller } from "@/lib/pythonRunner";

export async function POST() {
   try {
   await setChiller();
   return NextResponse.json({ success: true });
   } catch (error) {
   return NextResponse.json({ error: String(error) }, { status: 500 });
   }
}