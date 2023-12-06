import { ArrowUpIcon } from "@chakra-ui/icons";
import { Flex, Tooltip, useToast } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "components/DataTable";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { getProcesses } from "services/processManagement/processes";
import { getSequencesSortedStagesIds } from "utils/sorting";
import { labelByProcessStatus } from "utils/constants";
import { Pagination } from "components/Pagination";
import { useAuth } from "hooks/useAuth";

type AccordionFlowProps<DataFlow extends object> = {
  data: DataFlow & { actionsProps: any };
};

export default function FlowData<DataFlow extends object>({
  data,
}: AccordionFlowProps<DataFlow>) {
  const { flow } = data.actionsProps;
  const { state } = useLocation();
  const [currentPage, setCurrentPage] = useState(0);
  const toast = useToast();

  const { getUserData } = useAuth();
  const { /* data: userData, */ isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });

  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  const {
    data: processesData,
    isFetched: isProcessesFetched,
    refetch: refetchProcesses,
  } = useQuery({
    queryKey: ["processes", `flow=${flow?.idFlow}`],
    queryFn: async () => {
      const res = await getProcesses(
        flow?.idFlow,
        {
          offset: currentPage * 5,
          limit: 5,
        },
        undefined,
        false,
        ["inProgress", "notStarted"]
      );

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
    cacheTime: 0,
  });

  const processesTableRows = useMemo<TableRow<Process>[]>(() => {
    if (!isProcessesFetched || processesData?.value === undefined) {
      return [];
    }

    return (
      (processesData?.value?.reduce(
        (
          acc: TableRow<Process>[] | Process[],
          curr: TableRow<Process> | Process
        ) => {
          const currFlow = curr?.flow as Flow;

          const sortedStagesIds = getSequencesSortedStagesIds(
            currFlow?.sequences
          );
          const currIndexInFlow = sortedStagesIds?.indexOf(curr?.idStage) || -1;
          const currentState =
            (currFlow?.stages && currIndexInFlow !== -1) ||
            curr.status === "notStarted"
              ? `${currIndexInFlow + 1}/${sortedStagesIds?.length}`
              : `${currIndexInFlow + 2}/${sortedStagesIds?.length}`;

          return [
            ...acc,
            {
              ...curr,
              actionsProps: {
                process: curr,
                pathname: `/processos/${curr.record}`,
                state: {
                  process: curr,
                  ...(state || {}),
                },
              },
              // @ts-ignore
              record: curr.idPriority ? (
                <Flex flex="1" alignItems="center" gap="1">
                  {curr.record}
                  <Tooltip
                    label="Prioridade legal"
                    hasArrow
                    background="blackAlpha.900"
                    placement="right"
                  >
                    <ArrowUpIcon boxSize={3.5} />
                  </Tooltip>
                </Flex>
              ) : (
                curr.record
              ),
              currentState: `${
                curr.status === "finished"
                  ? `${currFlow?.stages?.length}/${currFlow?.stages?.length}`
                  : currentState
              }`,
              flowName: currFlow?.name,
              // @ts-ignore
              status: labelByProcessStatus[curr.status],
            },
          ];
        },
        []
      ) as TableRow<Process>[]) || []
    );
  }, [isProcessesFetched, processesData]);

  useEffect(() => {
    refetchProcesses();
  }, [currentPage]);

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
    tableColumnHelper.accessor("stageName", {
      cell: (info) => info.getValue(),
      header: "Etapa Atual",
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
  ];

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      marginTop="2%"
      border="1px solid rgba(0, 0, 0, 0.1)"
      borderRadius="4px"
    >
      <DataTable
        data={processesTableRows}
        columns={tableColumns}
        isDataFetching={!isProcessesFetched || !isUserFetched}
        emptyTableMessage={`Não foram encontrados processos${
          flow ? ` no fluxo ${flow.name}` : ""
        }.`}
      />
      {processesData?.totalPages !== undefined ? (
        <Pagination
          pageCount={processesData?.totalPages}
          onPageChange={handlePageChange}
        />
      ) : null}
    </Flex>
  );
}
