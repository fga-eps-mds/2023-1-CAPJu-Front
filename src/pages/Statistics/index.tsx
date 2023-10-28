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
  Image,
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
  });

  const [openSelectStage, setOpenSelectStage] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(-1);
  const [selectedStage, setSelectedStage] = useState(-1);
  const [stages, setStages] = useState<{ [key: number]: any }>([]);
  const [filteredProcess, setFilteredProcess] = useState<Process[]>([]);
  const [showProcesses, setShowProcesses] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 3;

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
        doc.save(`quantidade_processos_por_etapa_do_fluxo_${selectedFlow}`);
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
        downloadProcess(
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
                pathname: `/processos/${curr.record}`,
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

  const handleConfirmSelectionFlow = async () => {
    if (selectedFlow >= 0) {
      setOpenSelectStage(true);

      const stagesResult = await getCountProcessByIdFlow(selectedFlow);

      if (stagesResult.type === "success") {
        setStages(stagesResult.value);
      }
    } else {
      toast({
        id: "error-no-selection",
        title: "Erro!",
        description: "Selecione um fluxo antes de confirmar.",
        status: "error",
        isClosable: true,
      });

      setOpenSelectStage(false);
    }
  };

  const getProcessByPage = async () => {
    const offset = currentPage * limit;

    try {
      const processResult = await getStagesByIdFlow(
        selectedFlow,
        selectedStage,
        offset,
        limit
      );

      if (processResult.type === "success") {
        const { value, totalPages: total } = processResult;
        setFilteredProcess(value);
        setTotalPages(total ?? 0);
      } else {
        toast({
          id: "error-getting-stages",
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

  useEffect(() => {
    if (showProcesses) {
      getProcessByPage();
    }
  }, [currentPage, showProcesses]);

  const handleConfirmSelectionStages = async () => {
    if (selectedStage) {
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
          label: "Etapas",
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

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text
            fontSize="22px"
            fontWeight="600"
            fontStyle="normal"
            lineHeight="24px"
          >
            Estatísticas
          </Text>
        </Flex>
        <Box borderRadius="8px">
          <Flex justifyContent="flex-start" w="100%" flexDirection="column">
            <CustomAccordion
              title="Visualizar quantidade de processos em cada etapa"
              marginBottom={18}
            >
              {openSelectStage ? (
                <>
                  <Flex alignItems="center">
                    <Select
                      placeholder="Selecione a etapa"
                      marginLeft="36px"
                      width="302px"
                      onChange={(e) => {
                        setSelectedStage(Number(e.target.value));
                        setCurrentPage(0);
                      }}
                    >
                      {Object.values(stages).map((stage) => (
                        <option key={stage.idStage} value={stage.idStage}>
                          {stage.name}
                        </option>
                      ))}
                    </Select>
                    <Button
                      colorScheme="green"
                      marginLeft="20px"
                      marginRight="42%"
                      onClick={() => {
                        setOpenSelectStage(false);
                        handleConfirmSelectionStages();
                      }}
                    >
                      Confirmar
                    </Button>
                    <Flex>
                      {showProcesses && (
                        <ExportExcel
                          excelData={filteredProcess}
                          fileName={`Processos_do_fluxo_${selectedFlow}_na_etapa_${selectedStage}`}
                        />
                      )}
                      <Flex marginRight="30%">
                        <Button
                          onClick={
                            showProcesses
                              ? () => DownloadPDFProcess()
                              : DownloadPDFChart
                          }
                          colorScheme="blue"
                          size="md"
                        >
                          <Image width="3em" src="src/images/pdf.svg" />
                        </Button>
                      </Flex>
                    </Flex>
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
                        onPageChange={({ selected }) =>
                          setCurrentPage(selected)
                        }
                      />
                    </Flex>
                  ) : (
                    <Flex flexDir="column">
                      <Grid
                        w="50%"
                        h="30%"
                        marginLeft="3.2%"
                        marginTop="57.12px"
                      >
                        <BarChart
                          id="chart-etapas-fluxo"
                          selectedFlow={selectedFlow}
                          chartData={chartData}
                        />
                      </Grid>
                    </Flex>
                  )}
                </>
              ) : (
                <Flex>
                  <Select
                    placeholder="Selecione o fluxo"
                    marginLeft="36px"
                    width="302px"
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
                    marginLeft="20px"
                    onClick={() => {
                      setOpenSelectStage(true);
                      handleConfirmSelectionFlow();
                    }}
                  >
                    Confirmar
                  </Button>
                </Flex>
              )}
            </CustomAccordion>
          </Flex>
        </Box>
        <StepDeadlineReports />
        <FilteringProcesses />
      </Flex>
    </PrivateLayout>
  );
}
