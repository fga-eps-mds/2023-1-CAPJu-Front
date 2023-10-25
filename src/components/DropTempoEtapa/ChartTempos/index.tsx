import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Dispatch, SetStateAction, useState } from "react";
import LineChart from "./LineChart";
import { Data } from "../index";
import "./styles.css"

export interface ChartData {
  labels: Array<string>;
  datasets: Array<{
    label: string;
    data: Array<number>;
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    tension: number;
  }>;
}

Chart.register(CategoryScale);

export default function ChartTempos({ value, nameFlow }: { value: Data[], nameFlow: string }) {
  const [nameFlow2] = useState<string>(nameFlow);

  const [chartData]: [ChartData, Dispatch<SetStateAction<ChartData>>] = useState<ChartData>({
    labels: value.map(({ Etapa }) => Etapa),
    datasets: [
      {
        label: "Tempo Médio",
        data: value.map(({ "Tempo Médio": medio }) => medio),
        borderColor: "#ff5252",
        backgroundColor: "#ff5252",
        borderWidth: 4,
        tension: 0.4
      },
      {
        label: "Tempo Previsto",
        data: value.map(({ "Tempo Previsto": previsto }) => previsto),
        borderColor: "#0090ff",
        backgroundColor: "#0090ff",
        borderWidth: 4,
        tension: 0.4
      }
    ]
  });

  return (
    <div className="LineChart" >
      <LineChart chartData={chartData} nameFlow={nameFlow2} />
    </div>
  );
}
