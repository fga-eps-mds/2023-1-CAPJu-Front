import { Flex } from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import useChartData from "../../chartUtils";

// import { Container } from './styles';

interface BarChartProps {
  tableVisible: boolean;
  processes: Process[];
  start: string;
  end: string;
  selectedStatus: string;
}

const BarChart = ({
  tableVisible,
  processes,
  start,
  end,
  selectedStatus,
}: BarChartProps): JSX.Element => {
  const { months, archived, finished } = useChartData(processes, start, end);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Gráfico de Processos Concluídos / Interrompidos por Mês",
      },
    },
  };

  return (
    <Flex w="70%" alignSelf="center">
      {!tableVisible && (
        <Bar
          id="chart-quantidade-de-processos"
          options={options}
          data={{
            labels: months,
            datasets: [
              {
                label: "Processos Concluídos",
                data: archived,
                backgroundColor: "rgba(32, 143, 92, 0.9)",
                hidden: selectedStatus === "archived",
              },
              {
                label: "Processos Interrompidos",
                data: finished,
                backgroundColor: "rgba(174, 58, 51, 0.9)",
                hidden: selectedStatus === "finished",
              },
            ],
          }}
        />
      )}
    </Flex>
  );
};

export default BarChart;
