import { useToast, Box, Flex, Button, Text, Input } from "@chakra-ui/react";
import CustomAccordion from "components/CustomAccordion";
import { DataTable } from "components/DataTable";
import { useEffect, useState, useMemo } from "react";
import { getFlows } from "services/processManagement/flows";
import { createColumnHelper } from "@tanstack/react-table";
import { useQuery } from "react-query";
import { useAuth } from "hooks/useAuth";
import { isActionAllowedToUser } from "utils/permissions";
import { ViewIcon } from "@chakra-ui/icons";
import { getProcessesByDueDate } from "services/processManagement/statistics";

export default function StepDeadlineReports() {
  const toast = useToast();
  const { getUserData } = useAuth();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });

  const [flows, setFlows] = useState([] as Flow[]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [tableVisible, setTableVisible] = useState(false);
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

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
    queryKey: ["processesInDue"],
    queryFn: async () => {
      setIsFetching(false);
      const res = await getProcessesByDueDate(
        minDate,
        maxDate,
      );
      setIsFetching(true);

      if (res.type === "error") throw new Error(res.error.message);
      return res;
    },
    onError: () => {
      toast({
        id: "processes-error",
        title: "Erro ao carregar processos",
        description:
          "Insira o período de validade.",
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

  const filteredStepDeadlineReports = useMemo<TableRow<Process>[]>(() => {
    if (isFetching) return [];

    const value = processesData?.value;
    console.log({ value });
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
    tableColumnHelper.accessor("nameflow", {
      cell: (info) => info.getValue(),
      header: "Fluxo",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("namestage", {
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

  const handleConfirmClick = async () => {
    setTableVisible(true);
    refetchProcesses();
  };

  return (
    <Flex
      justifyContent="flex-start"
      w="90%"
      maxW={1120}
      flexDir="column"
      gap="3"
      mb="4"
    >
      <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
        <Text
          fontSize="lg"
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
            title="Visualizar processos filtrados por data de vencimento"
            marginBottom={18}
          >
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
                      onClick={handleConfirmClick}
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
                    <Button colorScheme="facebook" w="10%">
                      PDF
                    </Button>
                    <Button colorScheme="facebook" w="10%">
                      CSV
                    </Button>
                  </Flex>
                </Flex>
              </Flex>

              <Flex w="110%" marginTop="15">
                {tableVisible && (
                  <DataTable
                    data={filteredStepDeadlineReports}
                    columns={tableColumns}
                    isDataFetching={!isProcessesFetched || !isUserFetched}
                    emptyTableMessage="Não foram encontrados processos"
                  />
                )}
              </Flex>
            </>
          </CustomAccordion>
        </Flex>
      </Box>
    </Flex>
  );
}
