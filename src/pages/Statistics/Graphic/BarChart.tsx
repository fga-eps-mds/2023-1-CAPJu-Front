import { Bar } from "react-chartjs-2";
import type { ChartData } from "chart.js";

interface BarChartProps {
  id: string;
  selectedFlow: Number | String;
  chartData: ChartData<"bar">;
}

const BarChart = ({ id, chartData, selectedFlow }: BarChartProps) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Quantidade Processos por etapa d${
          typeof selectedFlow === "number"
            ? `o fluxo ${selectedFlow}`
            : `e ${selectedFlow}`
        } `,
        color: "black",
      },
    },
  };

  return (
    <div id={id} className="chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
