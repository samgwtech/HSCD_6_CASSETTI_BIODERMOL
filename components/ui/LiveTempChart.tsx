"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type CsvApiResponse = {
  columns: (number | string)[][];
};

function num(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function toTimeLabel(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

// Simple trend: EMA (exponential moving average)
function ema(values: number[], alpha = 0.2) {
  if (values.length === 0) return [];
  const out: number[] = [];
  let prev = values[0];
  out.push(prev);
  for (let i = 1; i < values.length; i++) {
    const next = alpha * values[i] + (1 - alpha) * prev;
    out.push(next);
    prev = next;
  }
  return out;
}

export default function SpecialChartPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep only last N points so the chart stays readable/performs well
  const MAX_POINTS = 300;

  const [points, setPoints] = useState<
    { t: string; sec: number; temp: number; trend: number }[]
  >([]);

  const fetchCsv = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/csv", { cache: "no-store" });
      if (!res.ok) throw new Error(`CSV API failed: ${res.status}`);

      const data = (await res.json()) as CsvApiResponse;
      const cols = data.columns;

      // Based on your CSV: col0=SECONDS, col3=TEMPERATURE
      const secCol = (cols[0] ?? []).map(num);
      const tempCol = (cols[3] ?? []).map(num);

      // Drop header row if your API includes it as strings in columns
      // (If you already removed header server-side, you can delete this)
      const startIdx =
        typeof (cols[0]?.[0] ?? "") === "string" ? 1 : 0;

      const secs = secCol.slice(startIdx);
      const temps = tempCol.slice(startIdx);

      // Keep last MAX_POINTS
      const sliceFrom = Math.max(0, secs.length - MAX_POINTS);
      const secsS = secs.slice(sliceFrom);
      const tempsS = temps.slice(sliceFrom);

      const trend = ema(tempsS, 0.2);

      const nextPoints = secsS.map((s, i) => ({
        sec: s,
        t: toTimeLabel(s),
        temp: tempsS[i] ?? 0,
        trend: trend[i] ?? 0,
      }));

      setPoints(nextPoints);
      setLoading(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown fetch error";
      setError(msg);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCsv();
    const id = setInterval(fetchCsv, 1000);
    return () => clearInterval(id);
  }, [fetchCsv]);

  const latest = useMemo(() => points[points.length - 1], [points]);

  return (
    <div className="min-h-screen p-6 bg-background text-text">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Special Temperature Chart</h1>
            <p className="text-sm text-gray-400">
              Live temp + trend (EMA) updating every second
            </p>
          </div>

          <div className="text-right text-sm">
            {loading ? (
              <div className="text-gray-400">Loading…</div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : latest ? (
              <>
                <div>
                  <span className="text-gray-400">Latest:</span>{" "}
                  <span className="font-semibold">{latest.temp.toFixed(1)} °C</span>
                </div>
                <div>
                  <span className="text-gray-400">Trend:</span>{" "}
                  <span className="font-semibold">{latest.trend.toFixed(1)} °C</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="w-full h-[420px] rounded-xl border border-white/10 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" minTickGap={30} />
              <YAxis domain={[0, 120]} />
              <Tooltip />
              <Legend />

              {/* Raw temperature: solid, thicker */}
              <Line
                type="monotone"
                dataKey="temp"
                name="Temperature (°C)"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              />

              {/* Trend: different color + dashed */}
              <Line
                type="monotone"
                dataKey="trend"
                name="Trend (EMA)"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="8 6"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="text-xs text-gray-500">
          Notes: Trend uses EMA(alpha=0.2). Increase alpha (0.3–0.5) for a faster trend,
          decrease for smoother.
        </div>
      </div>
    </div>
  );
}
