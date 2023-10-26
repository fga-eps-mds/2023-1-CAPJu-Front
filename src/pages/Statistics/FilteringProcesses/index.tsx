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
import { DataTable } from "components/DataTable";
import { useEffect, useState, useMemo, ChangeEvent } from "react";
import { useLocation } from "react-router-dom";
import { getFlows } from "services/processManagement/flows";
import { createColumnHelper } from "@tanstack/react-table";
import { getProcesses } from "services/processManagement/processes";
import { useQuery } from "react-query";
import { useAuth } from "hooks/useAuth";
import { isActionAllowedToUser } from "utils/permissions";
import { ViewIcon } from "@chakra-ui/icons";
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
import { Pagination } from "components/Pagination";
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
      text: "Comparativo de Processos Concluídos e Interrompidos por Mês",
    },
  },
};

export default function FilteringProcesses() {
  const toast = useToast();
  const { getUserData } = useAuth();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });

  const [flows, setFlows] = useState([] as Flow[]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [tableVisible, setTableVisible] = useState(true);
  const [selectedFlowValue, setSelectedFlowValue] = useState<string>("");

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [key, setKey] = useState(Math.random());

  const [selectedStatus, setSelectedStatus] = useState("");
  const [filter] = useState<string | undefined>(undefined);
  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };
  const { state } = useLocation();

  const getDataFlows = async () => {
    const dataFlows = await getFlows();
    if (dataFlows.value) setFlows(dataFlows.value);
  };

  useEffect(() => {
    if (flows.length === 0) getDataFlows();
  }, []);

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
        selectedStatus === "" || !tableVisible
          ? ["archived", "finished"]
          : [selectedStatus],
        fromDate === "" ? undefined : fromDate,
        toDate === "" ? undefined : toDate
      );
      setIsFetching(false);

      if (res.type === "error") throw new Error(res.error.message);
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
  });

  const tableActions = useMemo<TableAction[]>(
    () => [
      {
        label: "Visualizar Processo",
        icon: <ViewIcon boxSize={4} />,
        isNavigate: true,
        actionName: "see-process",
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

    const value = replacer(processesData?.value);
    return (
      (value?.reduce(
        (
          acc: TableRow<Process>[] | Process[],
          curr: TableRow<Process> | Process
        ) => [
          ...acc,
          {
            ...curr,
            tableActions,
            actionsProps: {
              process: curr,
              pathname: `/processos/${curr.record}`,
              state: { process: curr, ...(state || {}) },
            },
            record: curr.record,
          },
        ],
        []
      ) as TableRow<Process>[]) || []
    );
  }, [
    processesData,
    isProcessesFetched,
    isUserFetched,
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
    tableColumnHelper.accessor("tableActions", {
      cell: (info) => info.getValue(),
      header: "Ações",
      meta: {
        isTableActions: true,
        isSortable: false,
      },
    }),
  ];

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
    } else if (fromDate.length === 0 || toDate.length === 0) {
      toast({
        id: "date-error",
        title: "Datas não preenchidas",
        description:
          "Por favor, preencha ambas as datas (início e fim) para filtrar por período.",
        status: "error",
        isClosable: true,
      });
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
  const [currentPage, setCurrentPage] = useState(0);
  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  useEffect(() => {
    if (currentPage === -1) {
      setCurrentPage(0);
    } else {
      refetchProcesses();
    }
  }, [currentPage, tableVisible]);

  const handleChartClick = async () => {
    const minDateValue = Date.parse(fromDate);
    const maxDateValue = Date.parse(toDate);

    if (
      fromDate.length > 0 &&
      toDate.length > 0 &&
      maxDateValue > minDateValue
    ) {
      setTableVisible((current) => !current);
      setCurrentPage(0);
    } else if (tableVisible) {
      if (fromDate.length === 0 || toDate.length === 0) {
        toast({
          id: "date-error",
          title: "Datas não preenchidas",
          description:
            "Por favor, preencha ambas as datas (início e fim) para ver o gráfico.",
          status: "error",
          isClosable: true,
        });
      } else if (maxDateValue <= minDateValue) {
        toast({
          id: "date-order-error",
          title: "Ordem das datas incorreta",
          description:
            "A data de início deve ser anterior à data de fim. Por favor, ajuste as datas e tente novamente.",
          status: "error",
          isClosable: true,
        });
      }
    }
  };

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
                  Visualizar quantidade de processos concluídos e/ou
                  interrompidos em cada etapa
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Flex justifyContent="space-between">
                <Flex w="70%" flexDirection="column">
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
                    {tableVisible && (
                      <Select
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        placeholder="Status"
                        w="35%"
                        color="gray.500"
                      >
                        <option value="archived">Concluído</option>;
                        <option value="finished">Interrompido</option>
                      </Select>
                    )}
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
                <Flex>
                  <Flex gap="2" alignItems="flex-end" alignSelf="end">
                    <Button
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => {
                        handleChartClick();
                        // reload();
                      }}
                    >
                      {!tableVisible ? "Ver relatório" : "Ver Gráfico"}
                    </Button>
                  </Flex>
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
                            backgroundColor: "rgba(255, 99, 132, 0.5)",
                          },
                          {
                            label: "Processos Interrompidos",
                            data: finished,
                            backgroundColor: "rgba(53, 162, 235, 0.5)",
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

const replacer = (processes: Process[] | undefined) => {
  if (!processes) return undefined;

  return processes.map((process) => {
    return {
      ...process,
      status: process.status === "archived" ? "Concluido" : "Interrompido",
    };
  });
};
