import { useEffect, useMemo, useState } from "react";
import { useAuth } from "hooks/useAuth";
import type { ChartData } from "chart.js";
import { CategoryScale } from "chart.js";
import { useLocation } from "react-router";
import { Box, Flex, Text, Button, useToast, Select } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import { createColumnHelper } from "@tanstack/react-table";
import { useQuery } from "react-query";
import Chart from "chart.js/auto";
import { PrivateLayout } from "layouts/Private";
import { getFlows } from "services/processManagement/flows";
import { getStagesByIdFlow } from "services/processManagement/statistics";
import { DataTable } from "components/DataTable";
import CustomAccordion from "components/CustomAccordion";
import { generateColorTransition } from "utils/geradorCor";
import { isActionAllowedToUser } from "utils/permissions";
import BarChart from "./Graphic/BarChart";

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
    if (selectedFlow) {
      setOpenSelectStage(true);

      const stagesResult = await getStagesByIdFlow(selectedFlow);

      if (stagesResult.type === "success") {
        const storeStages = stagesResult.value;

        setStages(storeStages);
        console.log("storeStages", storeStages);
      } else {
        toast({
          id: "error-getting-stages",
          title: "Erro ao buscar etapas",
          description: "Houve um erro ao buscar as etapas.",
          status: "error",
          isClosable: true,
        });
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

  const handleConfirmSelectionStages = () => {
    if (selectedStage) {
      setOpenSelectStage(true);

      try {
        setFilteredProcess(stages[selectedStage].process);
        setShowProcesses(true);
      } catch (error) {
        toast({
          id: "error-getting-process",
          title: "Erro ao buscar processos",
          description: "Houve um erro ao buscar os processos.",
          status: "error",
          isClosable: true,
        });
      }
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
          barPercentage: 0.75,
          barThickness: "flex",
          label: "Etapas",
          data: Object.values(stages).map((stage) => stage.countProcess),
          backgroundColor: generateColorTransition(
            "#FF0000",
            "#FBF3AC",
            Object.values(stages).length
          ),
          borderColor: "none",
        },
      ],
    };
  }, [stages]);

  const scaleStyle = {
    padding: "4rem",
  };

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
                  <Flex>
                    <Select
                      placeholder="Selecione a etapa"
                      marginLeft="36px"
                      width="302px"
                      onChange={(e) => setSelectedStage(Number(e.target.value))}
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
                      onClick={() => {
                        setOpenSelectStage(false);
                        handleConfirmSelectionStages();
                      }}
                    >
                      Confirmar
                    </Button>
                  </Flex>
                  {showProcesses ? (
                    <Flex marginTop="20px">
                      <DataTable
                        data={processesTableRows}
                        columns={tableColumns}
                        isDataFetching={false}
                        emptyTableMessage="Não foram encontrados processos"
                      />
                    </Flex>
                  ) : (
                    <Flex style={scaleStyle}>
                      <BarChart
                        selectedFlow={selectedFlow}
                        chartData={chartData}
                      />
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
      </Flex>
    </PrivateLayout>
  );
}
