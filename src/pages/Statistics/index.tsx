import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "hooks/useAuth";
import type { ChartData } from "chart.js";
import { CategoryScale } from "chart.js";
import { useLocation } from "react-router";
import {
  Box,
  Flex,
  Text,
  Button,
  useToast,
  Select,
  Grid,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { createColumnHelper } from "@tanstack/react-table";
import { useQuery } from "react-query";
import Chart from "chart.js/auto";
import { PrivateLayout } from "layouts/Private";
import { getFlows } from "services/processManagement/flows";
import {
  getAllProcessByStage,
  getCountProcessByIdFlow,
  getStagesByIdFlow,
} from "services/processManagement/statistics";
import { DataTable } from "components/DataTable";
import CustomAccordion from "components/CustomAccordion";
import { generateColorTransition } from "utils/geradorCor";
import { isActionAllowedToUser } from "utils/permissions";
import html2canvas from "html2canvas";
import JsPDF from "jspdf";
import { downloadProcess } from "utils/pdf";
import ExportExcel from "components/ExportExcel";
import { Pagination } from "components/Pagination";
import StatsTimeStage from "components/StatsTimeStage";
import BarChart from "./Graphic/BarChart";
import StepDeadlineReports from "./StepDeadlineReports";
import FilteringProcesses from "./FilteringProcesses";

export default function Statistics() {
  const { getUserData } = useAuth();
  const { state } = useLocation();

  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });

  useEffect(() => {
    return () => {
      setOpenSelectStage(false);
      setSelectedFlow(-1);
      setShowProcesses(false);
      setOpenChart(false);
    };
  }, []);

  const toast = useToast();
  const { data: flowsData } = useQuery({
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
    refetchOnWindowFocus: false,
  });

  const [openSelectStage, setOpenSelectStage] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(-1);
  const [currentFlowName, setCurrentFlowName] = useState<Number | String>("");
  const [selectedStage, setSelectedStage] = useState(-1);
  const [stages, setStages] = useState<{ [key: number]: any }>([]);
  const [filteredProcess, setFilteredProcess] = useState<Process[]>([]);
  const [showProcesses, setShowProcesses] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openChart, setOpenChart] = useState(false);
  const [preparedProcessesDownload, setPreparedProcessesDownload] = useState(
    [] as IIIFormatedProcess[]
  );
  const limit = 5;

  const tableColumnHelper = createColumnHelper<TableRow<any>>();

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
    [isUserFetched, userData]
  );

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
    tableColumnHelper.accessor("tableActions", {
      cell: (info) => info.getValue(),
      header: "Ações",
      meta: {
        isTableActions: true,
        isSortable: false,
      },
    }),
  ];

  const DownloadPDFChart = () => {
    const elem = document.querySelector<HTMLElement>("#chart-etapas-fluxo");

    if (elem) {
      html2canvas(elem).then((canvas) => {
        const dataURI = canvas.toDataURL("image/jpeg");

        canvas.remove();

        const doc = new JsPDF({
          orientation: "p",
          format: "a4",
          unit: "pt",
        });

        doc.addImage(dataURI, "JPEG", 35, 50, 520, 0);
        doc.save(`Quantidade_Processos_Etapas`);
      });
    }
  };

  const DownloadPDFProcess = useCallback(async () => {
    if (flowsData?.value) {
      setLoading(true);
      const res = flowsData?.value?.find(
        (flow) => flow.idFlow === selectedFlow
      ) ?? { name: "" };

      const resAllProcess = await getAllProcessByStage(
        selectedFlow,
        selectedStage
      );

      if (resAllProcess.type === "success") {
        await downloadProcess(
          stages[selectedStage].name,
          res.name,
          resAllProcess.value
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

      setLoading(false);
    }
  }, [stages, filteredProcess, flowsData]);

  const processesTableRows = useMemo<TableRow<Process>[]>(() => {
    if (filteredProcess.length <= 0) return [];

    return (
      (filteredProcess.reduce(
        (
          acc: TableRow<Process>[] | Process[],
          curr: TableRow<Process> | Process
        ) => {
          return [
            ...acc,
            {
              ...curr,
              tableActions,
              actionsProps: {
                process: curr,
                pathname: `/processos/${curr.idProcess}`,
                state: {
                  process: curr,
                  ...(state || {}),
                },
              },
              record: curr.record,
            },
          ];
        },
        []
      ) as TableRow<Process>[]) || []
    );
  }, [filteredProcess, tableActions]);

  useEffect(() => {
    if (currentFlowName !== "") {
      handleConfirmSelectionFlow();
      // console.log({currentFlowName})
    }
  }, [currentFlowName]);

  const handleConfirmSelectionFlow = async () => {
    if (selectedFlow > 0) {
      setOpenSelectStage(true);

      const stagesResult = await getCountProcessByIdFlow(selectedFlow);

      if (stagesResult.type === "success") {
        setStages(stagesResult.value);
      }
    }
  };

  const getProcessByPage = async () => {
    const offset = currentPage * limit;
    try {
      const processResult = await getStagesByIdFlow(
        selectedFlow,
        Number.isNaN(selectedStage) ? -1 : selectedStage,
        offset,
        limit
      );

      if (processResult.type === "success") {
        const { value, totalPages: total } = processResult;
        setFilteredProcess(value);
        setTotalPages(total ?? 0);
      } else {
        toast({
          id: "error-getting-process",
          title: "Erro ao buscar processos",
          description: "Houve um erro ao buscar processos.",
          status: "error",
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        id: "error-getting-process",
        title: "Erro ao buscar processos",
        description: "Houve um erro ao buscar os processos.",
        status: "error",
        isClosable: true,
      });
    }
  };

  function formatDataTable(processes: Process[]) {
    return processes.map((process) => {
      return {
        Registro: process.record,
        Apelido: process.nickname,
      };
    });
  }

  useEffect(() => {
    if (showProcesses) {
      getProcessByPage();
      const formatedData = formatDataTable(filteredProcess);
      setPreparedProcessesDownload(formatedData);
    }
  }, [currentPage, showProcesses]);

  const handleConfirmSelectionStages = async () => {
    if (selectedStage > 0 || Number.isNaN(selectedStage)) {
      setOpenSelectStage(true);
      await getProcessByPage();
      setShowProcesses(true);
    } else {
      toast({
        id: "error-no-selection",
        title: "Erro!",
        description: "Selecione uma etapa antes de confirmar.",
        status: "error",
        isClosable: true,
      });
    }
  };

  Chart.register(CategoryScale);

  const chartData: ChartData<"bar"> = useMemo(() => {
    return {
      labels: Object.values(stages).map((stage) => stage.name),
      datasets: [
        {
          barPercentage: 0.6,
          barThickness: "flex",
          label: "Processos",
          data: Object.values(stages).map((stage) => stage.countProcess),
          backgroundColor: generateColorTransition(
            "#FF0000",
            "#f7e90f",
            Object.values(stages).length
          ),
          borderColor: "none",
        },
      ],
    };
  }, [stages]);

  const updateFlowName = () => {
    if (flowsData?.value && selectedFlow > 0) {
      // setOpenSelectStage(false);
      const res = flowsData?.value?.find(
        (flow) => flow.idFlow === selectedFlow
      );
      if (!res) setCurrentFlowName(selectedFlow);
      else setCurrentFlowName(res.name);
    } else {
      toast({
        id: "error-no-selection",
        title: "Erro!",
        description: "Selecione um fluxo antes de confirmar.",
        status: "error",
        isClosable: true,
      });
    }
  };
  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4" mt="50px">
        <Flex w="50%" mb="2" justifyContent="start">
          <Text fontSize="25px" fontWeight="semibold">
            Estatísticas
          </Text>
        </Flex>
        <StatsTimeStage />
        <Box borderRadius="8px">
          <Flex justifyContent="flex-start" w="100%" flexDirection="column">
            <CustomAccordion
              title="Visualizar quantidade de processos em cada etapa"
              marginBottom={18}
              defaultIndex={[4]}
            >
              <>
                <Flex w="100%" gap="3">
                  <Flex w="35%" gap="3">
                    <Select
                      placeholder="Selecione o fluxo"
                      w="65%"
                      color="gray.500"
                      onChange={(e) => setSelectedFlow(Number(e.target.value))}
                    >
                      {flowsData?.value?.map((flow: any) => (
                        <option value={flow.idFlow} key={flow.name}>
                          {flow.name}
                        </option>
                      ))}
                    </Select>
                    <Button
                      colorScheme="green"
                      w="28%"
                      onClick={() => {
                        if (selectedFlow > 0) {
                          setOpenSelectStage(true);
                          setShowProcesses(false);
                          setOpenChart(true);
                        }
                        // handleConfirmSelectionFlow();
                        updateFlowName();
                      }}
                    >
                      Confirmar
                    </Button>
                  </Flex>

                  {openSelectStage ? (
                    <Flex
                      alignItems="center"
                      w="65%"
                      gap="5"
                      justifyContent="space-between"
                    >
                      <Flex w="53.85%" gap="5">
                        <Select
                          placeholder="Selecione a etapa"
                          color="gray.500"
                          width="65%"
                          onChange={(e) => {
                            setSelectedStage(Number(e.target.value));
                            setCurrentPage(0);
                          }}
                        >
                          {Object.values(stages).map((stage) => (
                            <option key={stage.idStage} value={stage.idStage}>
                              {stage.name === "nao iniciado"
                                ? "Não iniciado"
                                : stage.name}
                            </option>
                          ))}
                        </Select>
                        <Button
                          colorScheme="green"
                          w="28%"
                          onClick={() => {
                            if (
                              selectedStage > 0 ||
                              Number.isNaN(selectedStage)
                            ) {
                              setOpenSelectStage(true);
                              setOpenChart(false);
                            }
                            handleConfirmSelectionStages();
                          }}
                        >
                          Confirmar
                        </Button>
                      </Flex>
                      <Flex gap="5">
                        <Button
                          onClick={
                            showProcesses
                              ? () => DownloadPDFProcess()
                              : DownloadPDFChart
                          }
                          colorScheme="blue"
                          size="md"
                        >
                          <Text fontSize="16px"> PDF </Text>
                        </Button>

                        {showProcesses && (
                          <ExportExcel
                            excelData={preparedProcessesDownload}
                            fileName="Quantidade_Processos_Etapa"
                          />
                        )}
                      </Flex>
                    </Flex>
                  ) : (
                    <></>
                  )}
                </Flex>
                {showProcesses ? (
                  <Flex flexDir="column" alignItems="center" marginTop="2%">
                    <DataTable
                      data={processesTableRows}
                      columns={tableColumns}
                      isDataFetching={loading}
                      emptyTableMessage="Não foram encontrados processos"
                    />
                    <Pagination
                      pageCount={totalPages}
                      onPageChange={({ selected }) => setCurrentPage(selected)}
                    />
                  </Flex>
                ) : (
                  <Flex flexDir="column">
                    {openChart ? (
                      <Grid
                        w="50%"
                        h="30%"
                        marginLeft="3.2%"
                        marginTop="57.12px"
                      >
                        <BarChart
                          id="chart-etapas-fluxo"
                          selectedFlow={currentFlowName}
                          chartData={chartData}
                        />
                      </Grid>
                    ) : (
                      <></>
                    )}
                  </Flex>
                )}
              </>
            </CustomAccordion>
          </Flex>
        </Box>
        <StepDeadlineReports />
        <FilteringProcesses />
      </Flex>
    </PrivateLayout>
  );
}
