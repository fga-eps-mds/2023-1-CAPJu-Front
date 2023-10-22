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

  const [selectedStatus, setSelectedStatus] = useState("");

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };

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
        undefined,
        undefined,
        false,
        selectedStatus === "" || tableVisible
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
          { ...curr, tableActions, actionsProps: { process: curr } },
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

  const handleConfirmClick = async () => {
    refetchProcesses();
    reload();
  };

  const handleChartClick = async () => {
    if (toDate.length > 0 && fromDate.length > 0) {
      setTableVisible((current) => !current);
    } else if (tableVisible) {
      toast({
        id: "date-error",
        title: "Datas não preenchidas",
        description: "Preencha o periodo para ver o gráfico.",
        status: "error",
        isClosable: true,
      });
      setTableVisible(true);
    }
  };

  const [months, archived, finished, reload] = useChartData(
    filteredProcesses,
    fromDate,
    toDate
  );

  return (
    <Box backgroundColor="#FFF" borderRadius="8px">
      <Flex justifyContent="flex-start" w="100%">
        <Accordion defaultIndex={[0]} allowMultiple w="100%">
          <AccordionItem>
            <h2>
              <AccordionButton>
                <AccordionIcon
                  transform="rotate(270deg)"
                  transition="transform 0.2s"
                />
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
                    {!tableVisible && (
                      <Select
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        placeholder="Status"
                        w="35%"
                        color="gray.500"
                      >
                        <option value="archived">Concluído</option>
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
                <Flex w="110%" marginTop="15">
                  {tableVisible && (
                    <DataTable
                      data={filteredProcesses}
                      columns={tableColumns}
                      isDataFetching={!isProcessesFetched || !isUserFetched}
                      emptyTableMessage="Não foram encontrados processos"
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
