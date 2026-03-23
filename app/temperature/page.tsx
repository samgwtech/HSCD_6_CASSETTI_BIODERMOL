"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MagnetronPanel } from "@/components/ui/MagnetronPanel";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
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

function movingAverage(values: number[], windowSize: number) {
  const out: number[] = [];
  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= windowSize) sum -= values[i - windowSize];
    const denom = Math.min(i + 1, windowSize);
    out.push(sum / denom);
  }
  return out;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function tempToColorC(tempC: number) {
  const t = clamp(tempC, 0, 1800);

  const grey = { r: 130, g: 130, b: 130 };
  const blue = { r: 0, g: 130, b: 255 };
  const red = { r: 255, g: 0, b: 0 };

  let r = 0,
    g = 0,
    b = 0;

  if (t <= 1200) {
    const k = t / 1200;
    r = Math.round(lerp(grey.r, blue.r, k));
    g = Math.round(lerp(grey.g, blue.g, k));
    b = Math.round(lerp(grey.b, blue.b, k));
  } else {
    const k = (t - 1200) / 600;
    r = Math.round(lerp(blue.r, red.r, k));
    g = Math.round(lerp(blue.g, red.g, k));
    b = Math.round(lerp(blue.b, red.b, k));
  }

  return `rgb(${r}, ${g}, ${b})`;
}

function stageForTemp(tempC: number) {
  const t = clamp(tempC, 0, 1800);
  if (t < 1200) return { label: "STAGE 1", range: "0–1200°C", yMax: 1200 };
  if (t < 1500) return { label: "STAGE 2", range: "1200–1500°C", yMax: 1500 };
  return { label: "STAGE 3", range: "1500–1800°C", yMax: 1800 };
}

export default function TemperaturePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [seconds, setSeconds] = useState<number[]>([]);
  const [temp, setTemp] = useState<number[]>([]);

  // magnetron
  const [mwPowerRaw, setMwPowerRaw] = useState<number[]>([]); // 0..4095
  const [mwDutyMs, setMwDutyMs] = useState<number[]>([]); // e.g. 12000

  async function fetchCsv() {
    try {
      setError(null);

      const res = await fetch("/api/csv", { cache: "no-store" });
      if (!res.ok) throw new Error(`CSV API failed: ${res.status}`);

      const data = (await res.json()) as CsvApiResponse;
      const cols = data.columns ?? [];

      // 0 = SECONDS
      // 3 = TEMPERATURE
      // 7 = MW_POWER (raw 0..4095)
      // 8 = MW_DUTY_CYCLE (ms)
      const secCol = (cols[0] ?? []).map(num);
      const tempCol = (cols[3] ?? []).map(num);
      const mwPowerCol = (cols[7] ?? []).map(num);
      const mwDutyCol = (cols[8] ?? []).map(num);

      setSeconds(secCol);
      setTemp(tempCol);
      setMwPowerRaw(mwPowerCol);
      setMwDutyMs(mwDutyCol);

      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  useEffect(() => {
    fetchCsv();
    const id = setInterval(fetchCsv, 1000);
    return () => clearInterval(id);
  }, []);

  const trend = useMemo(() => movingAverage(temp, 10), [temp]);

  const windowed = useMemo(() => {
    const n = Math.min(
      seconds.length,
      temp.length,
      trend.length,
      mwPowerRaw.length,
      mwDutyMs.length
    );
    const start = Math.max(0, n - 300);

    return {
      start,
      n,
      seconds: seconds.slice(start, n),
      temp: temp.slice(start, n),
      trend: trend.slice(start, n),
      mwPowerRaw: mwPowerRaw.slice(start, n),
      mwDutyMs: mwDutyMs.slice(start, n),
    };
  }, [seconds, temp, trend, mwPowerRaw, mwDutyMs]);

  const chartData = useMemo(() => {
    const out = [];
    const len = windowed.n - windowed.start;
    for (let i = 0; i < len; i++) {
      out.push({
        t: toTimeLabel(windowed.seconds[i] ?? 0),
        temp: windowed.temp[i] ?? 0,
        trend: windowed.trend[i] ?? 0,
      });
    }
    return out;
  }, [windowed]);

  const currentTemp = temp.length ? temp[temp.length - 1] : 0;
  const currentTrend = trend.length ? trend[trend.length - 1] : 0;

  const slope = useMemo(() => {
    if (trend.length < 2) return { perSec: 0, perMin: 0 };

    const i1 = trend.length - 1;
    const i0 = trend.length - 2;

    const t1 = seconds[i1] ?? i1;
    const t0 = seconds[i0] ?? i0;
    const dt = Math.max(1e-6, t1 - t0);

    const dT = (trend[i1] ?? 0) - (trend[i0] ?? 0);
    const perSec = dT / dt;
    const perMin = perSec * 60;

    return { perSec, perMin };
  }, [trend, seconds]);

  const trendArrow =
    slope.perSec > 0.02 ? "↑" : slope.perSec < -0.02 ? "↓" : "→";

  const sliderDisplayMax = 2000;
  const sliderAllowedMax = 1800;

  const sliderValue = clamp(currentTrend, 0, sliderAllowedMax);
  const sliderPercent = (sliderValue / sliderDisplayMax) * 100;

  const sliderColor = tempToColorC(sliderValue);
  const stage = stageForTemp(sliderValue);

  // ✅ THIS is the stage-based Y axis cap you asked for
  const tempYAxisMax = stage.yMax;

  const m1200 = (1200 / sliderDisplayMax) * 100;
  const m1500 = (1500 / sliderDisplayMax) * 100;
  const m1800 = (1800 / sliderDisplayMax) * 100;

  const mwPowerPctWindowed = useMemo(
    () => windowed.mwPowerRaw.map((v) => (clamp(v, 0, 4095) / 4095) * 100),
    [windowed.mwPowerRaw]
  );

  return (
    <div className="min-h-screen p-6 bg-black text-text">
      <h1 className="text-2xl font-bold mb-4">Temperature Live</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="p-3 rounded border border-gray-700 min-w-[220px]">
          <div className="text-sm text-gray-400">Current temperature</div>
          <div className="text-2xl font-semibold">
            {currentTemp.toFixed(1)} °C
          </div>
        </div>

        <div className="p-3 rounded border border-gray-700 min-w-[220px]">
          <div className="text-sm text-gray-400">Current trend (moving avg)</div>
          <div className="text-2xl font-semibold">
            {currentTrend.toFixed(1)} °C {trendArrow}
          </div>
        </div>

        <div className="p-3 rounded border border-gray-700 min-w-[220px]">
          <div className="text-sm text-gray-400">Rate</div>
          <div className="text-base font-semibold">
            {slope.perSec >= 0 ? "+" : ""}
            {slope.perSec.toFixed(3)} °C/s
          </div>
          <div className="text-base font-semibold">
            {slope.perMin >= 0 ? "+" : ""}
            {slope.perMin.toFixed(2)} °C/min
          </div>
        </div>
      </div>

      {/* Stage slider */}
      <div className="mb-5 p-4 rounded border border-gray-700">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="text-sm text-gray-400">
            Stage (based on moving avg)
          </div>
          <div className="px-2 py-1 rounded border border-gray-600 text-sm font-semibold">
            {stage.label}{" "}
            <span className="text-gray-400 font-normal">({stage.range})</span>
          </div>
          <div className="text-sm text-gray-400">
            Value used:{" "}
            <span className="text-text font-semibold">
              {sliderValue.toFixed(1)} °C
            </span>
            <span className="text-gray-500"> (clamped to 1800°C)</span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>0°C</span>
          <span>2000°C</span>
        </div>

        <div className="relative h-4 rounded bg-gray-800 overflow-hidden">
          <div
            className="h-full"
            style={{
              width: `${sliderPercent}%`,
              background: sliderColor,
              transition: "width 250ms linear, background 250ms linear",
            }}
          />

          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-gray-300/40"
              style={{ left: `${m1200}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-gray-300/40"
              style={{ left: `${m1500}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-gray-300/40"
              style={{ left: `${m1800}%` }}
            />
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-6 rounded bg-white/90 border border-black/20"
            style={{
              left: `calc(${sliderPercent}% - 6px)`,
              transition: "left 250ms linear",
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Stage 1 starts</span>
          <span>1200°C</span>
          <span>1500°C</span>
          <span>1800°C</span>
        </div>
      </div>

      {loading && <div className="text-gray-400">Loading…</div>}
      {error && <div className="text-red-400">Error: {error}</div>}

      {/* Temperature chart */}
      <div className="w-full h-[420px] rounded border border-gray-700 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeOpacity={0.2} />
            <XAxis dataKey="t" tick={{ fontSize: 12 }} />

            {/* ✅ Stage-based Y axis cap */}
            <YAxis
              tick={{ fontSize: 12 }}
              domain={[0, tempYAxisMax]}
              allowDataOverflow
            />

            {/* Optional: visual target line at the current stage limit */}
            <ReferenceLine y={tempYAxisMax} stroke="#666" strokeDasharray="4 4" />

            <Tooltip />
            <Line
              type="monotone"
              dataKey="temp"
              name="Temperature"
              stroke="#22c55e"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="trend"
              name="Trend"
              stroke="#a855f7"
              dot={false}
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm text-gray-400 mt-3">
        Showing last ~300 samples. Trend is a 10-sample moving average.
        Current Y max (by stage): {tempYAxisMax}°C.
      </div>

      {/* Magnetron live panel */}
      <div className="mt-6">
        <MagnetronPanel
          labels={chartData.map((d) => d.t)}
          mwPowerPct={mwPowerPctWindowed}
          mwDutyMs={windowed.mwDutyMs}
        />
      </div>
    </div>
  );
}
