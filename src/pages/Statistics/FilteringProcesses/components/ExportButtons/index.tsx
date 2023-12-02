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
  const [formattedtoDate, setFormattedtoDate] = useState<string | undefined>(
    undefined
  );
  const [formattedfromDate, setFormattedfromDate] = useState<
    string | undefined
  >(undefined);

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
      console.log(formatedData);
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

    if (toDate === undefined || fromDate === undefined) {
      const toDateConvert = new Date(toDate);
      const fromDateConvert = new Date(fromDate);

      const dayMin = toDateConvert.getDate();
      const monthMin = toDateConvert.getMonth() + 1;
      const yearMin = toDateConvert.getFullYear();

      const dayMax = fromDateConvert.getDate();
      const montMax = fromDateConvert.getMonth() + 1;
      const yearMax = fromDateConvert.getFullYear();

      setFormattedtoDate(
        `${dayMin < 10 ? "0" : ""}${dayMin}/${
          monthMin < 10 ? "0" : ""
        }${monthMin}/${yearMin}`
      );
      setFormattedfromDate(
        `${dayMax < 10 ? "0" : ""}${dayMax}/${
          montMax < 10 ? "0" : ""
        }${montMax}/${yearMax}`
      );
    }

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
        formattedtoDate === undefined
          ? moment(twoYearsAgo).format("DD/MM/YYYY")
          : formattedtoDate,
        formattedfromDate === undefined
          ? moment(today).format("DD/MM/YYYY")
          : formattedfromDate,
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
