import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

function parseCsvToColumns(csv: string): (number | string)[][] {
  const rows = csv
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(","));

  if (rows.length === 0) return [];

  const colCount = Math.max(...rows.map((r) => r.length));
  const cols: (number | string)[][] = Array.from({ length: colCount }, () => []);

  for (const r of rows) {
    for (let c = 0; c < colCount; c++) {
      const raw = (r[c] ?? "").trim();
      const asNum = Number(raw);
      cols[c].push(Number.isFinite(asNum) && raw !== "" ? asNum : raw);
    }
  }
  return cols;
}

// This is a simple API route that reads the CSV file and returns its contents as JSON.
export async function GET() {
  const filePath = path.join(process.cwd(), "csv", "MONITORING.csv");
  const csv = await fs.readFile(filePath, "utf8");
  const columns = parseCsvToColumns(csv);
  return NextResponse.json({ columns });
}
