import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
   const { index, value } = await req.json();

   const envPath = path.join(process.cwd(), ".env");
   let env = fs.readFileSync(envPath, "utf-8");

   env = env.replace(/VALUE_TO_SET_CASSETTO_1=.*/, `VALUE_TO_SET_CASSETTO_1=${value}`);
   env = env.replace(/ADDRESS_CASSETTO_1=.*/, `ADDRESS_CASSETTO_1=${index}`);

   fs.writeFileSync(envPath, env);

   return NextResponse.json({ success: true });
}