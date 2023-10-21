import { Line } from "react-chartjs-2";
import {Data} from "../Data.tsx";

function LineChart({ chartData }: any) {
  return (
    <div className="chart-container">
      <h2 style={{ textAlign: "center" }}>Tempo de Conclusão por Etapa</h2>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top"
            },
            title: {
              display: true,
              text: "Fluxo 01"
            }
          }
        }}
      />
    </div>
  );
}
export default LineChart;
