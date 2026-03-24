// app/api/python/stop/route.ts
import { stopProcess } from "@/lib/pythonRunner";

export async function POST() {
  stopProcess();
  return Response.json({ running: false });
}