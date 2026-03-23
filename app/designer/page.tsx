"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import LiveTempChart from "@/components/ui/LiveTempChart";

type CsvApiResponse = {
  columns: (number | string)[][];
};

function num(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

export default function TemperaturePage() {
  const [labels, setLabels] = useState<string[]>([]);
  const [temp, setTemp] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCsv = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/csv", { cache: "no-store" });
      if (!res.ok) throw new Error(`CSV API failed: ${res.status}`);
      const data = (await res.json()) as CsvApiResponse;

      // Your CSV layout: [0]=SECONDS, [3]=TEMPERATURE
      const secCol = (data.columns[0] ?? []).map((v) => num(v));
      const tempCol = (data.columns[3] ?? []).map((v) => num(v));

      // format label mm:ss
      const l = secCol.map((s) => {
        const ss = Math.max(0, Math.floor(s));
        const mm = Math.floor(ss / 60);
        const rr = ss % 60;
        return `${mm}:${String(rr).padStart(2, "0")}`;
      });

      setLabels(l);
      setTemp(tempCol);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown fetch error";
      setError(msg);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCsv();
  }, [fetchCsv]);

  // Poll every second (works fine for training + real)
  useEffect(() => {
    const id = setInterval(fetchCsv, 1000);
    return () => clearInterval(id);
  }, [fetchCsv]);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Temperature (live + trend)</h1>
        {loading && <span className="text-sm text-violet-300">Loading…</span>}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>

      <LiveTempChart
        labels={labels}
        temp={temp}
        // tweak these:
        maxY={110}
        trendWindow={15} // moving average window (seconds)
      />
    </div>
  );
}
