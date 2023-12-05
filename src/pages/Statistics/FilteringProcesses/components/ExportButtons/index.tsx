import { Button } from "@chakra-ui/react";
import ExportExcel from "components/ExportExcel";
import { getProcesses } from "services/processManagement/processes";
import { downloadPDFQuantityProcesses } from "utils/pdf";
import { labelByProcessStatus } from "utils/constants";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";

// import { Container } from './styles';

interface ExportButtonProps {
  today: string;
  twoYearsAgo: string;
  selectedFlowValue: string;
  toDate: string;
  fromDate: string;
  processesData: Result<Process[]>;
  selectedStatus: string;
  toast: any;
  flows: Flow[];
  filter: any;
}

const ExportButtons = ({
  today,
  twoYearsAgo,
  selectedFlowValue,
  toDate,
  fromDate,
  processesData,
  selectedStatus,
  toast,
  flows,
  filter,
}: ExportButtonProps): JSX.Element => {
  const [preparedProcessesDownload, setPreparedProcessesDownload] = useState(
    [] as IFormatedProcess[]
  );
  const [resAllProcess, setResAllProcess] = useState<Result<Process[]> | null>(
    null
  );

  function formatDataTable(processes: Process[]) {
    return processes.map((process) => {
      return {
        Registro: process.record,
        Apelido: process.nickname,
        Fluxo: idFlowToFlowName(process.idFlow),
        // @ts-ignore
        Status: labelByProcessStatus[process.status],
      };
    });
  }

  async function getProcessesForDownload() {
    const processesForDownload = await getProcesses(
      parseInt(selectedFlowValue, 10),
      {
        offset: 0,
        limit: 0,
      },
      filter,
      false,
      selectedStatus === "" ? ["archived", "finished"] : [selectedStatus],
      fromDate === "" ? undefined : fromDate,
      toDate === "" ? undefined : toDate
    );

    setResAllProcess(processesForDownload);
    if (processesForDownload.value !== undefined) {
      const formatedData = formatDataTable(processesForDownload.value);
      setPreparedProcessesDownload(formatedData);
    }
  }

  useEffect(() => {
    getProcessesForDownload();
  }, [flows]);

  const idFlowToFlowName = useCallback(
    (idFlow: number | number[]) => {
      const flowNames = flows?.filter((flow) =>
        Array.isArray(idFlow)
          ? idFlow.includes(flow.idFlow)
          : idFlow === flow.idFlow
      );
      return flowNames[0]?.name;
    },
    [flows]
  );

  const handleDownloadPDFQuantityProcesses = useCallback(async () => {
    const flowName =
      selectedFlowValue === ""
        ? "Não Definido"
        : idFlowToFlowName(parseInt(selectedFlowValue, 10));

    const toDateConvert = toDate.length > 0 ? moment(toDate) : moment(today);
    const fromDateConvert =
      fromDate.length > 0 ? moment(fromDate) : moment(twoYearsAgo);

    let statusLabel;

    if (selectedStatus === "") {
      statusLabel = "Não Definido";
    } else if (selectedStatus === "archived") {
      statusLabel = "Interrompido";
    } else {
      statusLabel = "Concluído";
    }

    if (resAllProcess?.type === "success") {
      await downloadPDFQuantityProcesses(
        flowName,
        statusLabel,
        fromDateConvert.format("DD/MM/YYYY"),
        toDateConvert.format("DD/MM/YYYY"),
        resAllProcess.value,
        processesData?.totalProcesses,
        processesData?.totalArchived,
        processesData?.totalFinished
      );
    } else {
      toast({
        id: "error-getting-stages",
        title: "Erro ao baixar pdf",
        description: "Houve um erro ao buscar processos.",
        status: "error",
        isClosable: true,
      });
    }
  }, [selectedFlowValue, selectedStatus, toDate, fromDate, processesData]);

  return (
    <>
      <Button
        colorScheme="blue"
        size="md"
        onClick={handleDownloadPDFQuantityProcesses}
      >
        PDF
      </Button>
      <ExportExcel
        excelData={preparedProcessesDownload}
        fileName="Quantidade de Processos"
      />
    </>
  );
};

export default ExportButtons;
