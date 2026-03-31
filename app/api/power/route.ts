import { NextResponse } from "next/server";
import { setPower } from "@/lib/pythonRunner";

export async function POST() {
   try {
    await setPower();
   return NextResponse.json({ success: true });
   } catch (error) {
   return NextResponse.json({ error: String(error) }, { status: 500 });
   }
}