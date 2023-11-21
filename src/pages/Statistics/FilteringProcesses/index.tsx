import {
  useToast,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Select,
  Button,
  Text,
  Input,
} from "@chakra-ui/react";
import ExportExcel from "components/ExportExcel";
import { DataTable } from "components/DataTable";
import { Pagination } from "components/Pagination";
import { ProcessQuantifier } from "components/ProcessQuantifier";
import { ReactNode, useEffect, useState, useMemo, ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import { getFlows } from "services/processManagement/flows";
import { createColumnHelper } from "@tanstack/react-table";
import { getProcesses } from "services/processManagement/processes";
import { useQuery } from "react-query";
import { useAuth } from "hooks/useAuth";
import { isActionAllowedToUser } from "utils/permissions";
import { ViewIcon } from "@chakra-ui/icons";
import { labelByProcessStatus } from "utils/constants";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import useChartData from "./chartUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
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

export default function FilteringProcesses() {
  const toast = useToast();
  const { getUserData } = useAuth();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
    refetchOnWindowFocus: false,
  });
  const { state } = useLocation();

  const [flows, setFlows] = useState([] as Flow[]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [tableVisible, setTableVisible] = useState(true);
  const [selectedFlowValue, setSelectedFlowValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [key, setKey] = useState(Math.random());
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filter] = useState<string | undefined>(undefined);

  const { data: flowsData, isFetched: isFlowsFetched } = useQuery({
    queryKey: ["flows"],
    queryFn: async () => {
      const res = await getFlows();

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
    onError: () => {
      toast({
        id: "flows-error",
        title: "Erro ao carregar fluxos",
        description:
          "Houve um erro ao carregar fluxos, favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    },
  });

  const {
    data: processesData,
    isFetched: isProcessesFetched,
    refetch: refetchProcesses,
  } = useQuery({
    queryKey: ["processes"],
    queryFn: async () => {
      setIsFetching(true);
      const res = await getProcesses(
        parseInt(selectedFlowValue, 10),
        !tableVisible
          ? undefined
          : {
              offset: currentPage * 5,
              limit: 5,
            },
        filter,
        false,
        selectedStatus === "" ? ["archived", "finished"] : [selectedStatus],
        fromDate === "" ? undefined : fromDate,
        toDate === "" ? undefined : toDate
      );
      setIsFetching(false);
      if (res.type === "error") throw new Error(res.error.message);
      console.log(res);
      return res;
    },
    onError: () => {
      toast({
        id: "processes-error",
        title: "Erro ao carregar processos",
        description:
          "Houve um erro ao carregar processos, favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    },
    refetchOnWindowFocus: false,
  });

  const tableActions = useMemo<TableAction[]>(
    () => [
      {
        label: "Visualizar Processo",
        icon: <ViewIcon boxSize={4} />,
        isNavigate: true,
        actionName: 'see-process',
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "see-process"
        ),
      },
    ],
    [isProcessesFetched, isUserFetched, userData]
  );

  const filteredProcesses = useMemo<TableRow<Process>[]>(() => {
    if (isFetching) return [];
    return (
      (processesData?.value?.reduce(
        (
          acc: TableRow<Process>[] | Process[],
          curr: TableRow<Process> | Process
        ) => {
          const currFlow = flowsData?.value?.find(
            (item) =>
              item?.idFlow === ((curr?.idFlow as number[])[0] || curr?.idFlow)
          ) as Flow;
          return [
            ...acc,
            {
              ...curr,
              tableActions,
              actionsProps: {
                process: curr,
                pathname: `/processos/${curr.idProcess}`,
                state: { process: curr, ...(state || {}) },
              },
              flowName: currFlow?.name,
              // @ts-ignore
              status: labelByProcessStatus[curr.status],
            },
          ];
        },
        []
      ) as TableRow<Process>[]) || []
    );
  }, [
    processesData,
    isProcessesFetched,
    userData,
    isUserFetched,
    flowsData,
    isFlowsFetched,
    tableActions,
    isFetching,
  ]);
  const tableColumnHelper = createColumnHelper<TableRow<any>>();
  const tableColumns = [
    tableColumnHelper.accessor("record", {
      cell: (info) => info.getValue(),
      header: "Registro",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("nickname", {
      cell: (info) => info.getValue(),
      header: "Apelido",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("status", {
      cell: (info) => info.getValue(),
      header: "Status",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("flowName", {
      cell: (info) => info.getValue(),
      header: "Fluxo",
      meta: {
        isSortable: true,
      },
    }),
  ];

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedFlowValue(selectedValue);
  };

  const handleConfirmClick = () => {
    const minDateValue = Date.parse(fromDate);
    const maxDateValue = Date.parse(toDate);

    if (
      (fromDate.length === 0 && toDate.length === 0) ||
      (fromDate.length > 0 && toDate.length > 0 && maxDateValue > minDateValue)
    ) {
      setCurrentPage(-1);
      setKey(Math.random());
    } else {
      toast({
        id: "date-order-error",
        title: "Ordem das datas incorreta",
        description:
          "A data de início deve ser anterior à data de fim. Por favor, ajuste as datas e tente novamente.",
        status: "error",
        isClosable: true,
      });
    }
  };

  const handleChartClick = async () => {
    const minDateValue = Date.parse(fromDate);
    const maxDateValue = Date.parse(toDate);
    const currentDateValue = Date.now();

    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const twoYearsAgoValue = Date.parse(twoYearsAgo.toISOString());

    if (fromDate.length === 0 || toDate.length === 0) {
      if (tableVisible) {
        toast({
          id: "date-info",
          title: "Datas não esepcificadas",
          description:
            "Buscando todos os processos dentro do intervalo de 2 anos a partir da data atual.",
          status: "info",
          isClosable: true,
        });
      }

      setTableVisible((current) => !current);
      setCurrentPage(0);
    }
    if (
      fromDate.length > 0 &&
      toDate.length > 0 &&
      maxDateValue > minDateValue &&
      maxDateValue <= currentDateValue &&
      minDateValue >= twoYearsAgoValue
    ) {
      setTableVisible((current) => !current);
      setCurrentPage(0);
    }

    if (maxDateValue <= minDateValue) {
      toast({
        id: "date-order-error",
        title: "Ordem das datas incorreta",
        description:
          "A data de início deve ser anterior à data de fim. Por favor, ajuste as datas e tente novamente.",
        status: "error",
        isClosable: true,
      });
    }
  };

  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  const getDataFlows = async () => {
    const dataFlows = await getFlows();
    if (dataFlows.value) setFlows(dataFlows.value);
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getTwoYearsAgoDate = () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    twoYearsAgo.setDate(twoYearsAgo.getDate() + 1);
    return twoYearsAgo.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (flows.length === 0) getDataFlows();
  }, []);

  useEffect(() => {
    if (currentPage === -1) {
      setCurrentPage(0);
    } else {
      refetchProcesses();
    }
  }, [currentPage, tableVisible]);

  interface IFormatedProcess {
    Registro: number | ReactNode;
    Apelido: string;
    Fluxo: string;
    Status: string;
  }

  const [preparedProcessesDownload, setPreparedProcessesDownload] = useState(
    [] as IFormatedProcess[]
  );

  function idFlowToFlowName(idFlow: number | number[]) {
    const flowNames = flows
      ?.filter((flow) =>
        Array.isArray(idFlow)
          ? idFlow.includes(flow.idFlow)
          : idFlow === flow.idFlow
      )
      .map((flow) => flow.name);

    return flowNames ? flowNames.join(", ") : "";
  }

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
      undefined,
      filter,
      false,
      selectedStatus === "" ? ["archived", "finished"] : [selectedStatus],
      fromDate === "" ? undefined : fromDate,
      toDate === "" ? undefined : toDate
    );

    if (processesForDownload.value !== undefined) {
      const formatedData = formatDataTable(processesForDownload.value);
      setPreparedProcessesDownload(formatedData);
    }
  }

  useEffect(() => {
    getProcessesForDownload();
  }, [currentPage]);

  const [months, archived, finished] = useChartData(
    filteredProcesses,
    fromDate,
    toDate
  );

  return (
    <Box backgroundColor="#FFF" borderRadius="8px">
      <Flex justifyContent="flex-start" w="100%">
        <Accordion defaultIndex={[4]} allowMultiple w="100%">
          <AccordionItem>
            <h2>
              <AccordionButton>
                <AccordionIcon />
                <Box
                  as="span"
                  flex="1"
                  textAlign="left"
                  marginLeft="18"
                  fontSize="17px"
                  fontWeight="600"
                  fontStyle="normal"
                  lineHeight="24px"
                >
                  Visualizar quantidade de processos concluídos / interrompidos
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Flex w="70%" flexDirection="column" marginBottom="4">
                <Flex gap="5">
                  <Select
                    placeholder="Selecione o Fluxo"
                    color="gray.500"
                    value={selectedFlowValue}
                    onChange={handleSelectChange}
                  >
                    {flows?.map((flow) => {
                      return <option value={flow.idFlow}>{flow.name}</option>;
                    })}
                  </Select>

                  <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    placeholder="Status"
                    w="35%"
                    color="gray.500"
                  >
                    <option value="finished">Concluído</option>;
                    <option value="archived">Interrompido</option>
                  </Select>
                </Flex>
                <Flex alignItems="center" gap="5" marginTop="15">
                  <Input
                    w="50%"
                    type="date"
                    color="gray.500"
                    value={fromDate}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setFromDate(event.target.value);
                    }}
                    max={getCurrentDate()} // Define a data máxima como a data atual
                    min={getTwoYearsAgoDate()} // Define a data mínima como a data há dois anos
                  />
                  <Text>à</Text>
                  <Input
                    w="50%"
                    type="date"
                    color="gray.500"
                    value={toDate}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setToDate(event.target.value);
                    }}
                    max={getCurrentDate()} // Define a data máxima como a data atual
                    min={getTwoYearsAgoDate()} // Define a data mínima como a data há dois anos
                  />
                  <Button
                    colorScheme="whatsapp"
                    w="20%"
                    onClick={handleConfirmClick}
                  >
                    Confirmar
                  </Button>
                </Flex>
              </Flex>

              <Flex alignItems="flex-end" justifyContent="space-between">
                <Flex w="100%" gap="5">
                  <ProcessQuantifier
                    processQuantity={(
                      processesData?.totalProcesses || "--"
                    ).toString()}
                    description="Total de Processos"
                    numberColor="#44536D"
                  />
                  <ProcessQuantifier
                    processQuantity={(
                      processesData?.totalFinished || "--"
                    ).toString()}
                    description="Processos Concluídos"
                    numberColor="#208F5C"
                  />
                  <ProcessQuantifier
                    processQuantity={(processesData?.totalArchived || "--")
                      .toString()
                      .toString()}
                    description="Processos Interrompidos"
                    numberColor="#AE3A33"
                  />
                </Flex>
                <Flex gap="5">
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => {
                      handleChartClick();
                    }}
                  >
                    {!tableVisible ? "Ver relatório" : "Ver Gráfico"}
                  </Button>
                  <ExportExcel
                    excelData={preparedProcessesDownload}
                    fileName="Quantidade de Processos"
                  />
                </Flex>
              </Flex>

              <Flex flexDirection="column">
                <Flex
                  w="100%"
                  marginTop="15"
                  alignItems="center"
                  flexDirection="column"
                >
                  {tableVisible && (
                    <DataTable
                      data={filteredProcesses}
                      columns={tableColumns}
                      isDataFetching={!isProcessesFetched || !isUserFetched}
                      emptyTableMessage="Não foram encontrados processos"
                    />
                  )}
                  {processesData?.totalPages !== undefined && tableVisible && (
                    <Pagination
                      key={key}
                      pageCount={processesData?.totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </Flex>
                <Flex w="70%" alignSelf="center">
                  {!tableVisible && (
                    <Bar
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
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
    </Box>
  );
}
