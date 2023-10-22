import { Bar } from "react-chartjs-2";
import type { ChartData } from "chart.js";

interface BarChartProps {
  selectedFlow: Number;
  chartData: ChartData<"bar">;
}

const BarChart = ({ chartData, selectedFlow }: BarChartProps) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Quantidade de processos de cada etapa do fluxo ${selectedFlow}`,
        color: "black",
      },
    },
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
