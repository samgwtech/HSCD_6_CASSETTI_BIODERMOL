// app/api/python/training/route.ts
import { startTraining } from "@/lib/pythonRunner";

export async function POST() {
  startTraining();
  return Response.json({ mode: "training" });
}