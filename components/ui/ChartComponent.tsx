/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Card, CardContent, CardHeader } from "./card";

interface ChartProps {
  name_measurement: string;
  unit: string;
  labels: string[];
  data: number[];
  unitOfTime: string;
  max_x_axis: number;
  onHoverIndex?: (index: number) => void;
  color: string;
  /** NEW PROP: how many category steps to skip before showing the next tick */
  tickStep?: number;
  /** Optional custom height, if you have it in your original code */
  graphHeight?: number;
}

export default function ChartComponent({
  name_measurement,
  unit,
  labels,
  data,
  unitOfTime,
  max_x_axis,
  onHoverIndex,
  color,
  tickStep = 1,        // Default to 1 (show every label)
  graphHeight,
}: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels,              // each item is a category label
        datasets: [
          {
            label: unit,
            data,             // Y-values
            borderColor: "text-blue-400",
            backgroundColor: color,
            borderWidth: 1.5,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          x: {
            // Category axis by default
            min: 0,
            max: labels.length ? labels[labels.length - 1] : 0,
            title: {
              display: true,
              text: `Time (${unitOfTime})`,
            },
            ticks: {
              // Show a label only when the index is a multiple of tickStep
              callback: function (val, index) {
                return index % tickStep === 0 ? this.getLabelForValue(Number(val)) : "";
              },
            },
          },
          y: {
            min: 0,
            max: max_x_axis,
            title: {
              display: true,
              text: name_measurement,
            },
          },
        },
        onHover: (_, elements) => {
          if (elements?.length && onHoverIndex) {
            onHoverIndex(elements[0].index);
          }
        },
      },
    });

    const leaveHandler = () => onHoverIndex?.(-1);
    canvasRef.current?.addEventListener("mouseleave", leaveHandler);

    return () => {
      chart.destroy();
      canvasRef.current?.removeEventListener("mouseleave", leaveHandler);
    };
  }, [
    labels,
    data,
    unit,
    name_measurement,
    max_x_axis,
    unitOfTime,
    color,
    onHoverIndex,
    tickStep,
  ]);

  return (
    <Card className="w-full shadow">
          <div className="mt-50 ml-50 p-10 absolute opacity-40">
            <h1 className="w-50 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{name_measurement.toUpperCase()}</h1>
          </div>
      <CardHeader>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} className="bg-white rounded" height={graphHeight ?? 210} />
      </CardContent>
    </Card>
  );
}
