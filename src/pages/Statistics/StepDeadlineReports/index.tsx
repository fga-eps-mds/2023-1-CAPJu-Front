import { useEffect, useState, useMemo, useCallback } from "react";
import { useToast, Box, Flex, Button, Text, Input } from "@chakra-ui/react";
import CustomAccordion from "components/CustomAccordion";
import { DataTable } from "components/DataTable";
import { getFlows } from "services/processManagement/flows";
import { createColumnHelper } from "@tanstack/react-table";
import { useQuery } from "react-query";
import { useAuth } from "hooks/useAuth";
import { isActionAllowedToUser } from "utils/permissions";
import { ViewIcon } from "@chakra-ui/icons";
import { Pagination } from "components/Pagination";
import { getProcessesByDueDate } from "services/processManagement/statistics";
import { useLocation } from "react-router-dom";
import { useStatisticsFilters } from "hooks/useStatisticsFilters";
import { downloadProcessInDue } from "utils/pdf";
import ExportExcel from "components/ExportExcel";

export default function StepDeadlineReports() {
  const toast = useToast();
  const { getUserData } = useAuth();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });

  const [flows, setFlows] = useState([] as Flow[]);
  const { state } = useLocation();
  const { isMinDate } = useStatisticsFilters();
  const { setContextMinDate } = useStatisticsFilters();
  const { isMaxDate } = useStatisticsFilters();
  const { setContextMaxDate } = useStatisticsFilters();
  const { ContinuePage } = useStatisticsFilters();
  const { setContinuePage } = useStatisticsFilters();
  const [tableVisible, setTableVisible] = useState(false);
  const [minDate, setMinDate] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [maxDate, setMaxDate] = useState<string>("");
  const [processData, setProcessData] = useState<Process[]>([]);
  const [processDueTotalPages, setProcessDueTotalPages] = useState<
    number | undefined
  >();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [preparedProcessesDownloadinDue, setPreparedProcessesDownloadInDue] =
    useState([] as IIFormatedProcess[]);

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
    return processes?.map((process) => {
      return {
        Registro: process.record,
        Apelido: process.nickname,
        Fluxo: idFlowToFlowName(process.idFlow),
        "Etapa Atual": process.nameStage,
        "Data de Vencimento da Etapa": process.dueDate,
      };
    });
  }

  async function getProcessesForDownload() {
    const processesForDownload = await getProcessesByDueDate(minDate, maxDate);

    if (processesForDownload.value !== undefined) {
      const formatedData = formatDataTable(processesForDownload.value);
      setPreparedProcessesDownloadInDue(formatedData);
    }
  }

  async function getContinueProcessesForDownload() {
    if (isMinDate && isMaxDate) {
      const ContinueprocessesForDownload = await getProcessesByDueDate(
        isMinDate,
        isMaxDate
      );
      if (ContinueprocessesForDownload?.value !== undefined) {
        const formatedData = formatDataTable(
          ContinueprocessesForDownload.value
        );
        setPreparedProcessesDownloadInDue(formatedData);
      }
    }
  }

  useEffect(() => {
    getContinueProcessesForDownload();
  }, [isMinDate, isMaxDate]);

  useEffect(() => {
    const handlePageChange = async () => {
      setLoading(true);
      await handleProcessByDueDate(minDate, maxDate, currentPage);
      setLoading(false);
    };

    if (minDate && maxDate) handlePageChange();
  }, [currentPage]);

  const getDataFlows = async () => {
    const dataFlows = await getFlows();
    if (dataFlows.value) setFlows(dataFlows.value);
  };

  const handleProcessByDueDate = async (
    paramMinDate: string,
    paramMaxDate: string,
    paramCurrentPage: number
  ) => {
    const res = await getProcessesByDueDate(paramMinDate, paramMaxDate, {
      offset: paramCurrentPage * 5,
      limit: 5,
    });

    if (res.type === "error") throw new Error(res.error.message);

    setProcessData(res.value);
    setProcessDueTotalPages(res.totalPages);
  };

  useEffect(() => {
    if (flows.length === 0) getDataFlows();
    setContinuePage(false);

    const handlePageBack = async (
      paramMinDate: string,
      paramMaxDate: string
    ) => {
      setMinDate(paramMinDate);
      setMaxDate(paramMaxDate);
      setLoading(true);
      setIsFetching(true);
      await handleProcessByDueDate(paramMinDate, paramMaxDate, currentPage);
      setTableVisible(true);
      setIsFetching(false);
      setLoading(false);
    };

    if (isMinDate !== undefined && isMaxDate !== undefined)
      handlePageBack(isMinDate, isMaxDate);
  }, []);

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

  const DownloadPDFProcess = useCallback(async () => {
    const minDateConvert = new Date(minDate);
    const maxDateConvert = new Date(maxDate);

    const dayMin = minDateConvert.getDate() + 1;
    const monthMin = minDateConvert.getMonth() + 1;
    const yearMin = minDateConvert.getFullYear();

    const dayMax = maxDateConvert.getDate() + 1;
    const montMax = maxDateConvert.getMonth() + 1;
    const yearMax = maxDateConvert.getFullYear();

    const formattedMinDate = `${dayMin < 10 ? "0" : ""}${dayMin}/${
      monthMin < 10 ? "0" : ""
    }${monthMin}/${yearMin}`;
    const formattedMaxDate = `${dayMax < 10 ? "0" : ""}${dayMax}/${
      montMax < 10 ? "0" : ""
    }${montMax}/${yearMax}`;

    const resAllProcess = await getProcessesByDueDate(minDate, maxDate);

    if (resAllProcess.type === "success") {
      await downloadProcessInDue(
        formattedMinDate,
        formattedMaxDate,
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
  }, [minDate, maxDate]);

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
    tableColumnHelper.accessor("nameFlow", {
      cell: (info) => info.getValue(),
      header: "Fluxo",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("nameStage", {
      cell: (info) => info.getValue(),
      header: "Etapa Atual",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("dueDate", {
      cell: (info) => info.getValue(),
      header: "Data de Vencimento na Etapa",
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

  const filteredStepDeadlineReports = useMemo<TableRow<Process>[]>(() => {
    if (processData.length <= 0) return [];

    return (
      (processData.reduce(
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
  }, [processData, tableActions]);

  const handleConfirmClick = async (
    ParamMinDate: string,
    paramMaxDate: string
  ) => {
    const minDateValue = Date.parse(ParamMinDate);
    const maxDateValue = Date.parse(paramMaxDate);
    const today = new Date();

    const ano = today.getFullYear();
    const mes = String(today.getMonth() + 1).padStart(2, "0");
    const dia = String(today.getDate()).padStart(2, "0");

    const todayFormatted = `${ano}-${mes}-${dia}`;
    const todayParsed = Date.parse(todayFormatted);

    if (Number.isNaN(minDateValue) || Number.isNaN(maxDateValue)) {
      toast({
        id: "date-validation-error",
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        status: "error",
        isClosable: true,
      });
    } else if (maxDateValue < minDateValue) {
      toast({
        id: "date-selected-error",
        title: "Erro",
        description: "Por favor, insira uma data maior que a outra",
        status: "error",
        isClosable: true,
      });
    } else if (minDateValue < todayParsed) {
      toast({
        id: "date-today-validation-error",
        title: "Erro",
        description:
          "Por favor, inicie com uma data igual ou posteior à de hoje",
        status: "error",
        isClosable: true,
      });
    } else {
      setContextMinDate(minDate);
      setContextMaxDate(maxDate);
      setTableVisible(true);
      try {
        setIsFetching(true);
        await handleProcessByDueDate(minDate, maxDate, currentPage);
        setIsFetching(false);
      } catch (error) {
        toast({
          id: "processes-error",
          title: "Erro ao carregar processos",
          description: "Insira o período de validade.",
          status: "error",
          isClosable: true,
        });
      }
    }
  };

  return (
    <Flex
      justifyContent="flex-start"
      w="100%"
      maxW={1120}
      flexDir="column"
      gap="3"
      mb="4"
    >
      <Box borderRadius="8px">
        <Flex justifyContent="flex-start" w="100%" flexDirection="column">
          <CustomAccordion
            defaultIndex={ContinuePage ? [0] : [4]}
            title="Visualizar processos filtrados por data de vencimento"
          >
            <>
              <Flex justifyContent="space-between">
                <Flex w="70%" flexDirection="column">
                  <Flex alignItems="center" gap="5">
                    <Input
                      w="50%"
                      type="date"
                      color="gray.500"
                      defaultValue={
                        isMinDate !== undefined ? isMinDate : undefined
                      }
                      onChange={(event) => {
                        const novoValor = event.target.value;
                        setMinDate(novoValor);
                      }}
                    />
                    <Text>até</Text>
                    <Input
                      w="50%"
                      type="date"
                      color="gray.500"
                      defaultValue={
                        isMaxDate !== undefined ? isMaxDate : undefined
                      }
                      onChange={(event) => {
                        const novoValor = event.target.value;
                        setMaxDate(novoValor);
                      }}
                    />
                    <Button
                      colorScheme="green"
                      w="20%"
                      onClick={() => {
                        handleConfirmClick(minDate, maxDate);
                      }}
                    >
                      Confirmar
                    </Button>
                  </Flex>
                </Flex>
                <Flex>
                  <Flex
                    gap="2"
                    alignItems="flex-end"
                    alignSelf="end"
                    marginEnd={1}
                  >
                    {tableVisible && (
                      <>
                        <ExportExcel
                          excelData={preparedProcessesDownloadinDue}
                          fileName="Processos_em_Vencimento"
                        />
                        <Button
                          colorScheme="blue"
                          size="md"
                          onClick={() => {
                            DownloadPDFProcess();
                            getProcessesForDownload();
                          }}
                        >
                          PDF
                        </Button>
                      </>
                    )}
                  </Flex>
                </Flex>
              </Flex>
              <Flex w="100%" marginTop="15">
                {tableVisible && (
                  <DataTable
                    data={filteredStepDeadlineReports}
                    columns={tableColumns}
                    isDataFetching={isFetching || loading}
                    emptyTableMessage="Não foram encontrados processos"
                  />
                )}
              </Flex>
              <Flex justifyContent="center">
                {processDueTotalPages !== undefined ? (
                  <Pagination
                    pageCount={processDueTotalPages}
                    onPageChange={(selectedPage) => {
                      setCurrentPage(selectedPage.selected);
                    }}
                  />
                ) : null}
              </Flex>
            </>
          </CustomAccordion>
        </Flex>
      </Box>
    </Flex>
  );
}
