import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function fmt1(n: number) {
  return Number.isFinite(n) ? n.toFixed(1) : "0.0";
}

function ActivityStrip({
  valuesPct,
  height = 28,
  maxBars = 120, // last 120 samples (~2 min at 1 Hz)
}: {
  valuesPct: number[];
  height?: number;
  maxBars?: number;
}) {
  const bars = useMemo(() => {
    const slice = valuesPct.slice(-maxBars);
    return slice.map((v) => clamp(v, 0, 100));
  }, [valuesPct, maxBars]);

  return (
    <div className="w-full rounded border border-gray-700 px-2 py-2">
      <div className="text-sm text-gray-400 mb-1">Magnetron activity (last samples)</div>
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {bars.map((v, i) => (
          <div
            key={i}
            title={`${fmt1(v)}%`}
            className="w-[3px] rounded-sm"
            style={{
              height: `${Math.max(2, (v / 100) * height)}px`,
              backgroundColor: v <= 0 ? "#374151" : "#ef4444", // off = gray, on = red
              opacity: v <= 0 ? 0.4 : 0.85,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function MagnetronPanel({
  labels,
  mwPowerPct,
  mwDutyMs,
}: {
  labels: string[];       // your timeLabels
  mwPowerPct: number[];   // your mwPowerData (already %)
  mwDutyMs: number[];     // your mwDutyCycleData (ms)
}) {
  const currentPower = mwPowerPct.length ? mwPowerPct[mwPowerPct.length - 1] : 0;
  const currentDuty = mwDutyMs.length ? mwDutyMs[mwDutyMs.length - 1] : 0;

  // A simple “is active” heuristic
  const isActive = currentPower > 0.5;

  // Chart data (keep it snappy)
  const chartData = useMemo(() => {
    const n = Math.min(labels.length, mwPowerPct.length, mwDutyMs.length);
    const start = Math.max(0, n - 300);
    const out: { t: string; p: number; d: number }[] = [];
    for (let i = start; i < n; i++) {
      out.push({
        t: labels[i] ?? "",
        p: mwPowerPct[i] ?? 0,
        d: mwDutyMs[i] ?? 0,
      });
    }
    return out;
  }, [labels, mwPowerPct, mwDutyMs]);

  return (
    <div className="rounded border border-gray-700 p-4 space-y-4">
      <div className="flex gap-6 flex-wrap">
        <div className="p-3 rounded border border-gray-700 min-w-[210px]">
          <div className="text-sm text-gray-400">Current MW power</div>
          <div className="text-2xl font-semibold">{fmt1(currentPower)} %</div>
        </div>

        <div className="p-3 rounded border border-gray-700 min-w-[210px]">
          <div className="text-sm text-gray-400">Current duty / Ton</div>
          <div className="text-2xl font-semibold">{Math.round(currentDuty)} ms</div>
        </div>

        <div className="p-3 rounded border border-gray-700 min-w-[210px]">
          <div className="text-sm text-gray-400">Magnetron now</div>
          <div className="text-2xl font-semibold">
            <span style={{ color: isActive ? "#ef4444" : "#9ca3af" }}>
              {isActive ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      <ActivityStrip valuesPct={mwPowerPct} />

      <div className="w-full h-[360px] rounded border border-gray-700 p-2">
        <div className="text-sm text-gray-400 px-2 py-1">
          Power (%) + Duty/Ton (ms)
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeOpacity={0.2} />
            <XAxis dataKey="t" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              label={{ value: "Power %", angle: -90, position: "insideLeft" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              domain={["auto", "auto"]}
              label={{ value: "Duty/Ton ms", angle: 90, position: "insideRight" }}
            />
            <Tooltip />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="p"
              name="MW Power %"
              stroke="#ef4444"
              dot={false}
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="d"
              name="Duty/Ton (ms)"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm text-gray-400">
        Note: if your “duty cycle” is really Ton (ms), this is burst-style control.  
        If you can log a real enable bit (magnetron relay ON/OFF), the “Magnetron now” becomes exact.
      </div>
    </div>
  );
}
