import { spawn, ChildProcessWithoutNullStreams } from "child_process";

let processRef: ChildProcessWithoutNullStreams | null = null;
let currentMode: "real" | "training" | null = null;

export function setPower() {
  if (processRef) return;
  processRef = spawn("python", ["power/setPower.py "]);

  currentMode = "real";

  processRef.stdout.on("data", (d: Buffer) => {
    console.log("[SetPower]", d.toString());
  });

    processRef.stderr.on("data", (d: Buffer) => {
    console.error("[SetPower ERROR]", d.toString());
  });

  processRef.on("close", () => {
    processRef = null;
    currentMode = null;
  });
}

export function turnOffChiller() {
  if (processRef) return;

  processRef = spawn("python", ["chiller/turnOffChiller.py"]);

  currentMode = "real";

  processRef.stdout.on("data", (d: Buffer) => {
    console.log("[SetChiller]", d.toString());
  });

    processRef.stderr.on("data", (d: Buffer) => {
    console.error("[SetChiller ERROR]", d.toString());
  });

  processRef.on("close", () => {
    processRef = null;
    currentMode = null;
  });
}

export function setChiller() {
  if (processRef) return;

  processRef = spawn("python", ["chiller/setChiller.py"]);

  currentMode = "real";

  processRef.stdout.on("data", (d: Buffer) => {
    console.log("[SetChiller]", d.toString());
  });

    processRef.stderr.on("data", (d: Buffer) => {
    console.error("[SetChiller ERROR]", d.toString());
  });

  processRef.on("close", () => {
    processRef = null;
    currentMode = null;
  });
}

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
    "10",
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