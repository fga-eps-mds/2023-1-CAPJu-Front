import { Line } from "react-chartjs-2";
import { ChartData } from "../index";

function LineChart({
  id,
  chartData,
  nameFlow,
}: {
  id: string;
  chartData: ChartData;
  nameFlow: string;
}) {
  return (
    <div className="chart-container">
      <h2
        style={{ textAlign: "center", fontWeight: "bolder", marginTop: "10px" }}
      >
        Tempo de Conclusão por Etapa
      </h2>
      <Line
        id={id}
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
            },
            title: {
              display: true,
              text: nameFlow,
            },
          },
        }}
      />
    </div>
  );
}
export default LineChart;
