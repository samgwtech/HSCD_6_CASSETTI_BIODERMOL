"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import ChartComponent from "@/components/ui/ChartComponent";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Disable TLS cert validation globally (use with caution!)

type CsvApiResponse = {
  columns: (number | string)[][];
};

type ViewMode = "grid" | "single";
type Override = { startIndex: number; value: number };

function toTimeLabel(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function num(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : 0;
}

function getAt(arr: number[], idx: number, fallback = 0) {
  return idx >= 0 && idx < arr.length ? arr[idx] : fallback;
}

function avg(arr: number[]) {
  if (!arr.length) return 0;
  let s = 0;
  for (const v of arr) s += v;
  return s / arr.length;
}

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"real" | "training" | null>(null);
  const [chillerOn, setChillerOn] = useState(false);
  const [chillerLoading, setChillerLoading] = useState(false);
  const [selectedMW, setSelectedMW] = useState<string>("MW246");
  const [mwValue, setMwValue] = useState<string>("");
  const [mwLoading, setMwLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/python/status", { cache: "no-store" });
      const data = await res.json();
      setIsRunning(data.running);
      setMode(data.mode);

    } catch (e) {
      console.error("Failed to fetch status", e);
    }
  }, []);

  const startMeasurement = async () => {
    try {
      await fetch("/api/python/start", { method: "POST" });
      setIsRunning(true);
      setMode("real");
    } catch (e) {
      console.error("Failed to start", e);
    }
  };

  const stopMeasurement = async () => {
    try {
      await fetch("/api/python/stop", { method: "POST" });
      setIsRunning(false);
      setMode(null);
    } catch (e) {
      console.error("Failed to stop", e);
    }
  };

  const startTraining = async () => {
    try {
      await fetch("/api/python/training", { method: "POST" });
      setIsRunning(true);
      setMode("training");
    } catch (e) {
      console.error("Failed to start training", e);
    }
  };


{/*const toggleChiller = async () => {
    setChillerLoading(true);
    try {
      const newValue = chillerOn ? 0 : 1;
      const url = `https://192.168.151.102/api/set/op?op=M&index=232&val=${newValue}`;
      const res = await fetch(url, {
        headers: { "Authorization": "Bearer [add_apikey]" }
      });
      if (res.ok) setChillerOn(newValue === 1);
    } catch (e) {
      console.error("Chiller error:", e);
    } finally {
      setChillerLoading(false);
    }
  };*/}

const toggleChiller = async () => {
  setChillerLoading(true);
  const newValue = chillerOn ? 0 : 1;
  try {
    const res = await fetch("/api/chiller", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newValue })
    });
    if (res.ok) {
      setChillerOn(newValue === 1);
    }
    setChillerLoading(false);
  } catch (e) {
    console.error("Error:", e);
    setChillerLoading(false);
  }
};

const setMWPower = async () => {
  if (!mwValue) return;

  setMwLoading(true);

  try {
    const MW_MAP: Record<string, number> = {
      MW1: 1,
      MW2: 2,
      MW3: 3,
    };

    const mwIndex = MW_MAP[selectedMW];

    if (!mwIndex) {
      console.error("Invalid MW selection");
      return;
    }

    const res = await fetch("/api/mw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        index: mwIndex,
        value: Number(mwValue),
      }),
    });

    if (res.ok) {
      alert(`${selectedMW} impostato a ${mwValue}`);
      setMwValue("");
    } else {
      const err = await res.json();
      console.error("MW API error:", err);
    }
  } catch (e) {
    console.error("MW Power error:", e);
  } finally {
    setMwLoading(false);
  }
};

  const [hoverIndex, setHoverIndex] = useState<number>(-1);
  const [viewMode] = useState<ViewMode>("grid");
  const [activeChart, setActiveChart] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [timeLabels, setTimeLabels] = useState<string[]>([]);
  const [pressureData, setPressureData] = useState<number[]>([]);

  // Cassetti
  const [temp1Data, setTemp1Data] = useState<number[]>([]);
  const [originalMwPower1Data, setOriginalMwPower1Data] = useState<number[]>([]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [overrides2, setOverrides2] = useState<Override[]>([]);
  const [overrides3, setOverrides3] = useState<Override[]>([]);
  //const [overrideInput, setOverrideInput] = useState<string>("");

  const [temp2Data, setTemp2Data] = useState<number[]>([]);
  const [mwPower2Data, setMwPower2Data] = useState<number[]>([]);

  const [temp3Data, setTemp3Data] = useState<number[]>([]);
  const [mwPower3Data, setMwPower3Data] = useState<number[]>([]);

  const [temp4Data, setTemp4Data] = useState<number[]>([]);
  const [mwPower4Data, setMwPower4Data] = useState<number[]>([]);

  const [temp5Data, setTemp5Data] = useState<number[]>([]);
  const [mwPower5Data, setMwPower5Data] = useState<number[]>([]);

  const [temp6Data, setTemp6Data] = useState<number[]>([]);
  const [mwPower6Data, setMwPower6Data] = useState<number[]>([]);

  // Add a new override segment at given start index with value
  const addOverride = useCallback((startIndex: number, value: number) => {
    setOverrides((prev) => {
      // Remove any existing overrides that start at or after startIndex
      const filtered = prev.filter((o) => o.startIndex < startIndex);
      // Add the new segment
      const newOverrides = [...filtered, { startIndex, value }];
      // Keep them sorted by startIndex
      newOverrides.sort((a, b) => a.startIndex - b.startIndex);
      return newOverrides;
    });
  }, []);

  // Clear all override segments
  const clearOverrides = useCallback(() => {
    setOverrides([]);
  }, []);

  const addOverride2 = useCallback((startIndex: number, value: number) => {
  setOverrides2((prev) => {
    const filtered = prev.filter((o) => o.startIndex < startIndex);
    const newOverrides = [...filtered, { startIndex, value }];
    newOverrides.sort((a, b) => a.startIndex - b.startIndex);
    return newOverrides;
  });
}, []);

const clearOverrides2 = useCallback(() => {
  setOverrides2([]);
}, []);

const addOverride3 = useCallback((startIndex: number, value: number) => {
  setOverrides3((prev) => {
    const filtered = prev.filter((o) => o.startIndex < startIndex);
    const newOverrides = [...filtered, { startIndex, value }];
    newOverrides.sort((a, b) => a.startIndex - b.startIndex);
    return newOverrides;
  });
}, []);

const clearOverrides3 = useCallback(() => {
  setOverrides3([]);
}, []);

  // Compute displayed power for first cassette with layered overrides applied
  const displayMwPower1Data = useMemo(() => {
    if (originalMwPower1Data.length === 0) return [];
    if (overrides.length === 0) return originalMwPower1Data;

    const result = [...originalMwPower1Data];
    // For each index, find the override with the largest startIndex <= i
    for (let i = 0; i < result.length; i++) {
      let applicableOverride: Override | undefined;
      // Overrides are sorted, so we can iterate from the end
      for (let j = overrides.length - 1; j >= 0; j--) {
        if (overrides[j].startIndex <= i) {
          applicableOverride = overrides[j];
          break;
        }
      }
      if (applicableOverride) {
        result[i] = applicableOverride.value;
      }
    }
    return result;
  }, [originalMwPower1Data, overrides]);

  const displayMwPower2Data = useMemo(() => {
  if (mwPower2Data.length === 0) return [];
  if (overrides2.length === 0) return mwPower2Data;
  const result = [...mwPower2Data];
  for (let i = 0; i < result.length; i++) {
    let applicableOverride: Override | undefined;
    for (let j = overrides2.length - 1; j >= 0; j--) {
      if (overrides2[j].startIndex <= i) {
        applicableOverride = overrides2[j];
        break;
      }
    }
    if (applicableOverride) {
      result[i] = applicableOverride.value;
    }
  }
  return result;
}, [mwPower2Data, overrides2]);

const displayMwPower3Data = useMemo(() => {
  if (mwPower3Data.length === 0) return [];
  if (overrides3.length === 0) return mwPower3Data;
  const result = [...mwPower3Data];
  for (let i = 0; i < result.length; i++) {
    let applicableOverride: Override | undefined;
    for (let j = overrides3.length - 1; j >= 0; j--) {
      if (overrides3[j].startIndex <= i) {
        applicableOverride = overrides3[j];
        break;
      }
    }
    if (applicableOverride) {
      result[i] = applicableOverride.value;
    }
  }
  return result;
}, [mwPower3Data, overrides3]);

  // Handle override input changes
  {/*const handleOverrideChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOverrideInput(value);
    const numValue = parseFloat(value);
    if (value && !isNaN(numValue) && numValue !== 0) {
      // Determine start index: use hover index if valid, otherwise last point
      let startIdx = hoverIndex;
      if (startIdx === -1 && originalMwPower1Data.length > 0) {
        startIdx = originalMwPower1Data.length - 1;
      }
      if (startIdx >= 0) {
        addOverride(startIdx, numValue);
      } else {
        // No data yet, can't set override
        console.warn("No data points available to override");
        setOverrideInput("");
      }
    } else {
      // Clear all overrides
      clearOverrides();
    }
  };*/}

const handleMWValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setMwValue(value);
  const numValue = parseFloat(value);
  if (value && !isNaN(numValue) && numValue !== 0) {
    let startIdx = hoverIndex;
    if (startIdx === -1 && originalMwPower1Data.length > 0) {
      startIdx = originalMwPower1Data.length - 1;
    }
    if (startIdx >= 0) {
      // Aggiorna il cassetto corretto in base a selectedMW
      if (selectedMW === "MW246") {
        addOverride(startIdx, numValue);
      } else if (selectedMW === "MW247") {
        addOverride2(startIdx, numValue);
      } else if (selectedMW === "MW248") {
        addOverride3(startIdx, numValue);
      }
    }
  } else {
    clearOverrides();
    clearOverrides2();
    clearOverrides3();
  }
};

  const fetchCsv = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/csv", { cache: "no-store" });
      if (!res.ok) throw new Error(`CSV API failed: ${res.status}`);
      const data = (await res.json()) as CsvApiResponse;

      const cols = data.columns;

      const secCol = (cols[0] ?? []).map((v) => num(v));
      const pCol = (cols[2] ?? []).map((v) => num(v));
      const t1Col = (cols[3] ?? []).map((v) => num(v) / 10);
      const mwPower1Col = (cols[4] ?? []).map((v) => num(v));

      const t2Col = (cols[5] ?? []).map((v) => num(v) / 10);
      const mwPower2Col = (cols[6] ?? []).map((v) => num(v));

      const t3Col = (cols[7] ?? []).map((v) => num(v) / 10);
      const mwPower3Col = (cols[8] ?? []).map((v) => num(v));

      const t4Col = (cols[9] ?? []).map((v) => num(v) / 10);
      const mwPower4Col = (cols[10] ?? []).map((v) => num(v));

      const t5Col = (cols[11] ?? []).map((v) => num(v) / 10);
      const mwPower5Col = (cols[12] ?? []).map((v) => num(v));

      const t6Col = (cols[13] ?? []).map((v) => num(v) / 10);
      const mwPower6Col = (cols[14] ?? []).map((v) => num(v));

      setTimeLabels(secCol.map(toTimeLabel));
      setPressureData(pCol);
      setTemp1Data(t1Col);
      setOriginalMwPower1Data(mwPower1Col);

      setTemp2Data(t2Col);
      setMwPower2Data(mwPower2Col);

      setTemp3Data(t3Col);
      setMwPower3Data(mwPower3Col);

      setTemp4Data(t4Col);
      setMwPower4Data(mwPower4Col);

      setTemp5Data(t5Col);
      setMwPower5Data(mwPower5Col);

      setTemp6Data(t6Col);
      setMwPower6Data(mwPower6Col);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown fetch error";
      setError(msg);
      console.error("Data fetch error 🤕", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once on mount
  useEffect(() => {
    fetchCsv();
  }, [fetchCsv]);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 2000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  // Polling for CSV updates
  useEffect(() => {
    const id = setInterval(fetchCsv, 2500);
    return () => clearInterval(id);
  }, [fetchCsv]);

const charts = useMemo(
  () => [
    { name: "", max: 100, unit: "Temp Cassetto 1 (°C)", data: temp1Data, color: "rgba(150, 70, 54, 0.5)" },
    { name: "", max: 4095, unit: "MW Power Cassetto 1 (%)", data: displayMwPower1Data, color: "rgba(98,131,149,0.5)" },
    { name: "", max: 100, unit: "Temp Cassetto 2 (°C)", data: temp2Data, color: "rgba(150, 70, 54, 0.5)" },
    { name: "", max: 4095, unit: "MW Power Cassetto 2 (%)", data: displayMwPower2Data, color: "rgba(98,131,149,0.5)" }, // ← CAMBIATO
    { name: "", max: 100, unit: "Temp Cassetto 3 (°C)", data: temp3Data, color: "rgba(150, 70, 54, 0.5)" },
    { name: "", max: 4095, unit: "MW Power Cassetto 3 (%)", data: displayMwPower3Data, color: "rgba(98,131,149,0.5)" }, // ← CAMBIATO
    // ... resto uguale
  ],
  [temp1Data, displayMwPower1Data, temp2Data, displayMwPower2Data, temp3Data, displayMwPower3Data, temp4Data, mwPower4Data, temp5Data, mwPower5Data, temp6Data, mwPower6Data]
);

  // Keyboard + wheel nav in SINGLE view
  useEffect(() => {
    if (viewMode !== "single") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveChart((p) => (p === 0 ? charts.length - 1 : p - 1));
      }
      if (e.key === "ArrowRight") {
        setActiveChart((p) => (p + 1) % charts.length);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) setActiveChart((p) => (p + 1) % charts.length);
      else setActiveChart((p) => (p === 0 ? charts.length - 1 : p - 1));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
    };
  }, [viewMode, charts.length]);

  const overlay = useMemo(() => {
    if (hoverIndex < 0) return null;

    return (
      <div className="space-y-2 text-sm">
        <h1 className="text-2xl text-blue-500">Hover: {hoverIndex} 🔍</h1>
        <div>
          <strong className="text-blue-400">Temp Cassetto 1:</strong>{" "}
          {getAt(temp1Data, hoverIndex).toFixed(1)} °C
        </div>
        <div>
          <strong className="text-blue-400">MW Power Cassetto 1:</strong>{" "}
          {getAt(displayMwPower1Data, hoverIndex).toFixed(1)}%
        </div>
      </div>
    );
  }, [hoverIndex, temp1Data, displayMwPower1Data]);

  return (
    <DashboardLayout
      sidebar={
        <div className="space-y-2 text-sm text-gray-400 pl-4 pt-4">
          <div className="pt-4 space-y-2">
            <div>
              Mode:{" "} Real
              {/*{!isRunning
                ? "Stopped"
                : mode === "training"
                ? "Training"
                : mode === "real"
                ? "Real"
                : "Unknown"}*/}
            </div>
            <button
              onClick={startMeasurement}
              className="bg-green-600 px-3 py-1 rounded text-white"
            >
              Start Measurement
            </button>
            <button
              onClick={stopMeasurement}
              className="bg-red-600 px-3 py-1 rounded text-white"
            >
              Stop Measurement
            </button>
          </div>
          <button
            onClick={startTraining}
            className="bg-blue-600 px-3 py-1 rounded text-white"
          >
            Training Mode
          </button>

          <button
            onClick={toggleChiller}
            disabled={chillerLoading}
            className={`px-3 py-1 rounded text-white ${
              chillerOn ? "bg-cyan-600" : "bg-gray-600"
            } ${chillerLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {chillerLoading ? "Loading..." : chillerOn ? "Chiller: ON" : "Chiller: OFF"}
          </button>

          <div className="pt-4 space-y-2">
            <label className="block text-sm font-medium text-blue-400">Imposta MW Power</label>
            <select
              value={selectedMW}
              onChange={(e) => setSelectedMW(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            >
              <option>MW246</option>
              <option>MW247</option>
              <option>MW248</option>
            </select>
            <input
              type="number"
              value={mwValue}
              onChange={handleMWValueChange}
              placeholder="Valore (0-4095)"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            />
            <button
              onClick={setMWPower}
              disabled={mwLoading || !mwValue}
              className="w-full bg-purple-600 px-3 py-1 rounded text-white disabled:opacity-50"
            >
              {mwLoading ? "Loading..." : "Imposta MW"}
            </button>
          </div>

          {/* Override input for Cassetto 1 */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-blue-400">
              {/* Override MW Power Cassetto 1 (%)*/}
            </label>
            {/* <input
              type="number"
              value={overrideInput}
              onChange={handleOverrideChange}
              placeholder="0 = disabled"
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />*/}
          </div>

          <div className="pt-4 space-y-2">
            {loading && <div className="text-blue-400">Loading…</div>}
            {error && <div className="text-blue-400">{error}</div>}

            <div>
              <strong className="text-blue-400">Pressione HSCD in millibar:</strong>{" "}
              {getAt(pressureData, pressureData.length - 1, 0).toFixed(1)} mbar
            </div>

            <h1 className="text-blue-400 w-50 scroll-m-20 text-4xl font-bold tracking-tight lg:text">
              MEDIE
            </h1>
            <strong className="text-blue-400">CASSETTO 1</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp1Data).toFixed(1)} °C
              <br />
            </div>

            <strong className="text-blue-400">CASSETTO 2</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp2Data).toFixed(1)} °C
              <br />
            </div>

            <strong className="text-blue-400">CASSETTO 3</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp3Data).toFixed(1)} °C
              <br />
            </div>

            <strong className="text-blue-400">CASSETTO 4</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp4Data).toFixed(1)} °C
              <br />
            </div>

            <strong className="text-blue-400">CASSETTO 5</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp5Data).toFixed(1)} °C
              <br />
            </div>

            <strong className="text-blue-400">CASSETTO 6</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp6Data).toFixed(1)} °C
              <br />
            </div>
            {overlay && <div className="w-[40] space-y-4 text-sm z-50">{overlay}</div>}
          </div>
        </div>
      }
    >
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-2">
          {charts.map((ch, i) => (
            <ChartComponent
              key={i}
              name_measurement={ch.name}
              max_x_axis={ch.max}
              unit={ch.unit}
              unitOfTime=""
              labels={timeLabels}
              data={ch.data}
              onHoverIndex={setHoverIndex}
              color={ch.color}
              graphHeight={170}
            />
          ))}
        </div>
      ) : (
        <div className="m-auto min-h-[156.25] flex justify-center items-center max-h-[187.5]">
          <ChartComponent
            name_measurement={charts[activeChart]?.name ?? ""}
            max_x_axis={charts[activeChart]?.max ?? 100}
            unit={charts[activeChart]?.unit ?? ""}
            unitOfTime="sec"
            labels={timeLabels}
            data={charts[activeChart]?.data ?? []}
            onHoverIndex={setHoverIndex}
            color={charts[activeChart]?.color ?? "rgba(181, 114, 44, 0.25)"}
            graphHeight={200}
          />
        </div>
      )}
    </DashboardLayout>
  );
}