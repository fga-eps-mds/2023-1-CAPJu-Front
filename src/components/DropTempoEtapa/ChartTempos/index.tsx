import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { useState } from "react";
import Data from "./Data";
// import Config from "../utils/Config";
import LineChart from "./LineChart";
import "./styles.css"

Chart.register(CategoryScale);

interface Props {
  value: Promise<number[]>;
}

export default function ChartTempos( { value }: Props ) {
  const [chartData] = useState({
    labels: value.map((data: any) => data.label),
    datasets: [
      {
        label: "Tempo Médio",
        data: value.map((data: any) => data.medio),
        backgroundColor: "#ff5252",
        borderColor: "#ff5252",
        borderWidth: 4,
        tension: 0.4
      },
      {
        label: "Tempo Previsto",
        data: value.map((data: any) => data.previsto),
        borderColor: "#0090ff",
        backgroundColor: "#0090ff",
        borderWidth: 4,
        tension: 0.4
      }
    ]
  });

  return (
    <div className="LineChart">
      <LineChart chartData={chartData} />
    </div>
  );
}
