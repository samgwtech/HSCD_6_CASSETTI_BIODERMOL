// app/api/python/start/route.ts
import { startReal, getStatus } from "@/lib/pythonRunner";

export async function POST() {
   const status = getStatus();

   if (!status.running) {
   startReal();
  }

  return Response.json({ running: true });
}