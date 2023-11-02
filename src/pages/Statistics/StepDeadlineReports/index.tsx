import { useEffect, useState, useMemo } from "react";
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

export default function StepDeadlineReports() {
  const toast = useToast();
  const { getUserData } = useAuth();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });

  const [flows, setFlows] = useState([] as Flow[]);
  const { state } = useLocation();
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

  useEffect(() => {
    const handlePageChange = async () => {
      setLoading(true);
      await handleProcessByDueDate();
      setLoading(false);
    };

    if (minDate && maxDate) handlePageChange();
  }, [currentPage]);

  const getDataFlows = async () => {
    const dataFlows = await getFlows();
    if (dataFlows.value) setFlows(dataFlows.value);
  };

  const handleProcessByDueDate = async () => {
    const res = await getProcessesByDueDate(minDate, maxDate, {
      offset: currentPage * 5,
      limit: 5,
    });

    if (res.type === "error") throw new Error(res.error.message);

    setProcessData(res.value);
    setProcessDueTotalPages(res.totalPages);
  };

  useEffect(() => {
    if (flows.length === 0) getDataFlows();
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

  const handleConfirmClick = async () => {
    const minDateValue = Date.parse(minDate);
    const maxDateValue = Date.parse(maxDate);

    if (
      Number.isNaN(minDateValue) ||
      Number.isNaN(maxDateValue) ||
      minDateValue > maxDateValue
    ) {
      toast({
        id: "date-validation-error",
        title: "Erro",
        description:
          "Por favor, insira datas válidas e data da direita menor que a da esquerda",
        status: "error",
        isClosable: true,
      });
    } else {
      setTableVisible(true);
      try {
        setIsFetching(true);
        await handleProcessByDueDate();
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
          <CustomAccordion title="Visualizar processos filtrados por data de vencimento">
            <>
              <Flex justifyContent="space-between">
                <Flex w="70%" flexDirection="column">
                  <Flex alignItems="center" gap="5" marginTop="15">
                    <Input
                      w="50%"
                      type="date"
                      color="gray.500"
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
                      onChange={(event) => {
                        const novoValor = event.target.value;
                        setMaxDate(novoValor);
                      }}
                    />
                    <Button
                      colorScheme="whatsapp"
                      w="20%"
                      onClick={() => handleConfirmClick()}
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
                    marginEnd={-5}
                  >
                    {tableVisible && (
                      <>
                        <Button colorScheme="facebook" w="10%">
                          PDF
                        </Button>
                        <Button colorScheme="facebook" w="10%">
                          CSV
                        </Button>
                      </>
                    )}
                  </Flex>
                </Flex>
              </Flex>
              <Flex w="110%" marginTop="15">
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
                    onPageChange={(selectedPage) =>
                      setCurrentPage(selectedPage.selected)
                    }
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
