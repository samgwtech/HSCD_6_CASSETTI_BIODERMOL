// app/api/python/start/route.ts
import { setChiller } from "@/lib/pythonRunner";

export async function POST() {
   setChiller();
  return Response.json({ running: true });
}