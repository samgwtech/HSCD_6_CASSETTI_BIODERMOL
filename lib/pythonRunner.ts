import { spawn, ChildProcessWithoutNullStreams } from "child_process";

let processRef: ChildProcessWithoutNullStreams | null = null;
let currentMode: "real" | "training" | null = null;

export function startReal() {
  if (processRef) return;

  processRef = spawn("python", ["chart.py"]);

  currentMode = "real";

  processRef.stdout.on("data", (d: Buffer) => {
    console.log("[REAL]", d.toString());
  });

    processRef.stderr.on("data", (d: Buffer) => {
    console.error("[REAL ERROR]", d.toString());
  });

  processRef.on("close", () => {
    processRef = null;
    currentMode = null;
  });
}

export function startTraining() {
  if (processRef) return;

  processRef = spawn("python", [
    "training_chart.py",
    "--source",
    "csv/source.csv",
    "--interval",
    "1",
    "--loop",
  ]);

  currentMode = "training";

  processRef.stdout.on("data", (d: Buffer) => {
    console.log("[TRAINING]", d.toString());
  });

    processRef.stderr.on("data", (d: Buffer) => {
    console.error("[TRAINING ERROR]", d.toString());
  });

  processRef.on("close", () => {
    processRef = null;
    currentMode = null;
  });
}

export function stopProcess() {
  if (processRef) {
    processRef.kill();
    processRef = null;
    currentMode = null;
  }
}

export function getStatus() {
  return {
    running: processRef !== null,
    mode: currentMode,
  };
}