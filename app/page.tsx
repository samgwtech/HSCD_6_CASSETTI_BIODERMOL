"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "@/components/ui/DashboardLayout";
import ChartComponent from "@/components/ui/ChartComponent";

type CsvApiResponse = {
  // columns: array of columns, each column is an array of numbers/strings
  columns: (number | string)[][];
};

type ViewMode = "grid" | "single";

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
    setMode("training"); // ← ADD THIS
  } catch (e) {
    console.error("Failed to start training", e);
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

  // CASSETTI SET FUNCTIONS (6 CASSETTI)
  // Cassetto 1
  const [temp1Data, setTemp1Data] = useState<number[]>([]);
  const [mwPower1Data, setMwPower1Data] = useState<number[]>([]);

  // Cassetto 2
  const [temp2Data, setTemp2Data] = useState<number[]>([]);
  const [mwPower2Data, setMwPower2Data] = useState<number[]>([]);

    // Cassetto 3
  const [temp3Data, setTemp3Data] = useState<number[]>([]);
  const [mwPower3Data, setMwPower3Data] = useState<number[]>([]);

  // Cassetto 4
  const [temp4Data, setTemp4Data] = useState<number[]>([]);
  const [mwPower4Data, setMwPower4Data] = useState<number[]>([]);

    // Cassetto 5
  const [temp5Data, setTemp5Data] = useState<number[]>([]);
  const [mwPower5Data, setMwPower5Data] = useState<number[]>([]);

  // Cassetto 6
  const [temp6Data, setTemp6Data] = useState<number[]>([]);
  const [mwPower6Data, setMwPower6Data] = useState<number[]>([]);


    //<div>
    //      <strong className="text-blue-400">MW Power Cassetto 1:</strong>{" "}
    //      {getAt(mwPower1Data, hoverIndex).toFixed(1)}%
    //    </div>
  const fetchCsv = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/csv", { cache: "no-store" });
      if (!res.ok) throw new Error(`CSV API failed: ${res.status}`);
      const data = (await res.json()) as CsvApiResponse;

      const cols = data.columns;

      // TIMESTAMP, MILLIBAR MACCHINA, TEMPERATURA CASSETTO 1, POTENZA CASSETTO 1, TEMPERATURA CASSETTO 2, POTENZA CASSETTO 2, TEMPERATURA CASSETTO 3, POTENZA CASSETTO 3,TEMPERATURA CASSETTO 4, POTENZA CASSETTO 4, TEMPERATURA CASSETTO 5, POTENZA CASSETTO 5, TEMPERATURA CASSETTO 6, POTENZA CASSETTO 6
      //      index:0 lapsed_seconds, index:1 current_time_str, index:2 valore_vuoto_macchina, index:3 temp_cassetto_1, index:4 pow_cassetto_1, index:5 temp_cassetto_2, index:6 pow_cassetto_2, index:7 temp_cassetto_3, index:8 pow_cassetto_3, index:9 temp_cassetto_4, index:10 pow_cassetto_4, index:11 temp_cassetto_5, index:12 pow_cassetto_5, index:13 temp_cassetto_6, index:14 pow_cassetto_6

      const secCol = (cols[0] ?? []).map((v) => num(v));

      const pCol = (cols[2] ?? []).map((v) => (num(v)));

      const t1Col = (cols[3] ?? []).map((v) => (num(v)/10));
      const mwPower1Col = (cols[4] ?? []).map((v) => (num(v)));

      const t2Col = (cols[5] ?? []).map((v) =>  (num(v)/10));
      const mwPower2Col = (cols[6] ?? []).map((v) => (num(v)));

      const t3Col = (cols[7] ?? []).map((v) => (num(v)/10));
      const mwPower3Col = (cols[8] ?? []).map((v) => (num(v)));

      const t4Col = (cols[9] ?? []).map((v) => (num(v)/10));
      const mwPower4Col = (cols[10] ?? []).map((v) => (num(v)));

      const t5Col = (cols[11] ?? []).map((v) => (num(v)/10));
      const mwPower5Col = (cols[12] ?? []).map((v) => (num(v)));

      const t6Col = (cols[13] ?? []).map((v) => (num(v)/10));
      const mwPower6Col = (cols[14] ?? []).map((v) => (num(v)));

      setTimeLabels(secCol.map(toTimeLabel));

      setPressureData(pCol);
      setTemp1Data(t1Col);
      setMwPower1Data(mwPower1Col);

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

  // If you want “near real time” without SSE/WebSocket, uncomment this polling:
  // SET REFRESH TIME CSV
useEffect(() => {
  const id = setInterval(fetchCsv, 2500);
  return () => clearInterval(id);
}, [fetchCsv]);

  const charts = useMemo(
    () => [
      { name: "", max: 100, unit: "Temp Cassetto 1 (°C)", data: temp1Data, color: "rgba(150, 70, 54, 0.5)" },
      { name: "", max: 100, unit: "MW Power Cassetto 1 (%)", data: mwPower1Data, color: "rgba(98,131,149,0.5)" },
      { name: "", max: 100, unit: "Temp Cassetto 2 (°C)", data: temp2Data, color: "rgba(150, 70, 54, 0.5)" },
      { name: "", max: 100, unit: "MW Power Cassetto 2 (%)", data: mwPower2Data, color: "rgba(98,131,149,0.5)" },
      { name: "", max: 100, unit: "Temp Cassetto 3 (°C)", data: temp3Data, color: "rgba(150, 70, 54, 0.5)" },
      { name: "", max: 100, unit: "MW Power Cassetto 3 (%)", data: mwPower3Data, color: "rgba(98,131,149,0.5)" },
      { name: "", max: 100, unit: "Temp Cassetto 4 (°C)", data: temp4Data, color: "rgba(150, 70, 54, 0.5)" },
      { name: "", max: 100, unit: "MW Power Cassetto 4 (%)", data: mwPower4Data, color: "rgba(98,131,149,0.5)" },
      { name: "", max: 100, unit: "Temp Cassetto 5 (°C)", data: temp5Data, color: "rgba(150, 70, 54, 0.5)" },
      { name: "", max: 100, unit: "MW Power Cassetto 5 (%)", data: mwPower5Data, color: "rgba(98,131,149,0.5)" },
      { name: "", max: 100, unit: "Temp Cassetto 6 (°C)", data: temp6Data, color: "rgba(150, 70, 54, 0.5)" },
      { name: "", max: 100, unit: "MW Power Cassetto 6 (%)", data: mwPower6Data, color: "rgba(98,131,149,0.5)" },
    ],
    [temp1Data, mwPower1Data, temp2Data, mwPower2Data, temp3Data,mwPower3Data, temp4Data, mwPower4Data, temp5Data, mwPower5Data, temp6Data, mwPower6Data]
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
      // If you want to avoid hijacking scrolling, you can bind wheel on a container instead of window.
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
      </div>
    );
  }, [hoverIndex, temp1Data]);

//              <strong className="text-blue-400">MW Power medio:</strong> {avg(mwPower1Data).toFixed(1)}%
//              <strong className="text-blue-400">MW Power medio:</strong> {avg(mwPower2Data).toFixed(1)}%
//              <strong className="text-blue-400">MW Power medio:</strong> {avg(mwPower3Data).toFixed(1)}%
//              <strong className="text-blue-400">MW Power medio:</strong> {avg(mwPower4Data).toFixed(1)}%
//              <strong className="text-blue-400">MW Power medio:</strong> {avg(mwPower5Data).toFixed(1)}%
//              <strong className="text-blue-400">MW Power medio:</strong> {avg(mwPower6Data).toFixed(1)}%


  return (
    <DashboardLayout
      sidebar={
        <div className="space-y-2 text-sm text-gray-400 pl-4 pt-4">
        <div className="pt-4 space-y-2">
          <div>
        Mode: {
          !isRunning
            ? "Stopped"
            : mode === "training"
            ? "Training"
            : mode === "real"
            ? "Real"
            : "Unknown"
        }
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
          <div>
          </div>

          <div className="pt-4 space-y-2">
            {loading && <div className="text-blue-400-300">Loading…</div>}
            {error && <div className="text-blue-400">{error}</div>}

          <div>
          <strong className="text-blue-400">Pressione HSCD in millibar:</strong>{" "}
          {getAt(pressureData, pressureData.length - 1, 0).toFixed(1)} mbar
          </div>

            <h1 className="text-blue-400 w-50 scroll-m-20 text-4xl font-bold tracking-tight lg:text">MEDIE</h1>
            <strong className="text-blue-400">CASSETTO 1</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp1Data).toFixed(1)} °C
              <br/>
            </div>

            <strong className="text-blue-400">CASSETTO 2</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp2Data).toFixed(1)} °C
              <br/>
            </div>

            <strong className="text-blue-400">CASSETTO 3</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp3Data).toFixed(1)} °C
              <br/>
            </div>

                        <strong className="text-blue-400">CASSETTO 4</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp4Data).toFixed(1)} °C
              <br/>
            </div>

            <strong className="text-blue-400">CASSETTO 5</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp5Data).toFixed(1)} °C
              <br/>
            </div>

            <strong className="text-blue-400">CASSETTO 6</strong>
            <div>
              <strong className="text-blue-400">Temperatura media:</strong> {avg(temp6Data).toFixed(1)} °C
              <br/>
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
              unitOfTime="sec"
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
