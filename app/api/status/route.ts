import { NextResponse } from "next/server";

let lastUpdate: string | null = null; 

export async function GET() {
  let plcConnected = false;
  let apiKeyValid = false;

  // 🔐 1. verifica API key
  try {
    const res = await fetch("http://localhost:443/ping", {
      headers: {
        Authorization: `Bearer ${process.env.EASYSOFT_API_KEY}`,
      },
    });

    apiKeyValid = res.ok;
  } catch (e) {
   console.error("API key validation error:", e);
    apiKeyValid = false;
  }

  // 🔌 2. verifica PLC (semplificata)
  try {
    const res = await fetch("http://localhost:443/plc-status");
    plcConnected = res.ok;
  } catch (e) {
   console.error("API key validation error:", e);
    plcConnected = false;
  }

  return NextResponse.json({
    running: true,
    mode: "real",
    plcConnected,
    apiKeyValid,
    lastUpdate,
  });
}