import React, { useState } from "react";
import { ChartNoAxesCombined } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js/auto";
import { Line, Pie } from "react-chartjs-2";

// Register the custom color schema for the chart
const colorSchema = {
  blue: `rgba(${37}, ${99}, ${235}, 1)`,
  red: `rgba(${235}, ${99}, ${37}, 1)`,
  orange: `rgba(${235}, ${99}, ${37}, 1)`,
  green: `rgba(${37}, ${235}, ${99}, 1)`,
  purple: `rgba(${142}, ${68}, ${235}, 1)`,
  pink: `rgba(${235}, ${68}, ${142}, 1)`,
  yellow: `rgba(${255}, ${235}, ${68}, 1)`,
  black: `rgba(0, 0, 0, 1)`,
  transperant: `rgba(0, 0, 0, 0)`,
  white: `rgba(255, 255, 255, 1)`,
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Data for Line Graph //
const data = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [
    {
      // Color Blue Line
      label: "Reviewed ",
      data: [0, 200, 120, 600, 800, 1800, 2800],
      borderColor: colorSchema.blue,
      backgroundColor: "rgba(100, 156, 245, 0.2)",
      tension: 0.4,
      pointBackgroundColor: colorSchema.blue,
      pointBorderColor: colorSchema.white,
      fill: true,
    },
    {
      // Color Orange Line
      label: "Evaluated",
      data: [850, 400, 950, 1500, 2500, 3000, 12000],
      borderColor: colorSchema.orange,
      backgroundColor: "rgba(247, 191, 106, 0.2)",
      tension: 0.4,
      pointBackgroundColor: colorSchema.orange,
      pointBorderColor: colorSchema.white,
      fill: true,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        color: "#2563eb",
        font: { size: 16, weight: "bold" },
      },
    },
    title: {
      display: true,
      text: "Monthly Reviews and Evaluations",
      color: colorSchema.white,
      font: { size: 22, weight: "bold" },
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      ticks: { color: "#64748b", font: { size: 14 } },
      grid: { color: "#64748b" },
    },
    y: {
      ticks: { color: "#64748b", font: { size: 14 } },
      grid: { color: "#64748b" },
    },
  },
};

// Dummy Data for Pie Chart //
const Data = [
  { year: 2016, userGain: 800 },
  { year: 2017, userGain: 456 },
  { year: 2018, userGain: 1234 },
  { year: 2019, userGain: 900 },
  { year: 2020, userGain: 1500 },
];

const chartData = {
  labels: Data.map((data) => data.year.toString()),
  datasets: [
    {
      label: "Users Gained ",
      data: Data.map((data) => data.userGain),
      backgroundColor: [
        "rgba(75,192,192,0.6)",
        "rgba(250, 164, 77, 0.6)",
        "rgba(192, 108, 245, 0.5)",
        "#f3ba2f",
        "#2a71d0",
      ],
      borderColor: "#64748b",
      borderWidth: 2,
    },
  ],
};

type PieChartProps = {
  chartData: typeof chartData;
};

function PieChart({ chartData }: PieChartProps) {
  return (
    <div className="chart-container">
      <h2 style={{ textAlign: "center" }}>Pie Chart</h2>
      <Pie
        data={chartData}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Users Gained between 2016-2020",
            },
          },
        }}
      />
    </div>
  );
}

const Analytics: React.FC = () => (
  <>
    <div className="analytics-container mb-6 sm:mb-8 lg:mb-10">
      <div
        className="analytics-heading sm:text-3xl lg:text-4xl font-bold
      m-2 text-center text-wrap text-blue-800 dark:text-blue-300"
      >
        <ChartNoAxesCombined className=" sm:w-7 sm:h-7 inline-block m-2"/>
        <span>Student Analytics</span>
      </div>
      <div className="p-8 bg-white dark:bg-slate-800 text-xl dark:text-white border-2 border-blue-300/90 rounded-xl shadow-lg hover:shadow-blue-900 transition-all duration-300 m-[0.3rem]">
        <h2 className="text-center"> Line Chart</h2>
        <Line data={data} options={options} />
      </div>

      <div
        className="p-8 bg-white dark:bg-slate-800 text-xl dark:text-white border-2 border-blue-300/90 rounded-xl shadow-lg hover:shadow-blue-900 transition-all duration-300 m-[0.3rem]
    max-h-2xl max-w-2xl"
      >
        <PieChart chartData={chartData} />
      </div>
    </div>
  </>
);

export default Analytics;
