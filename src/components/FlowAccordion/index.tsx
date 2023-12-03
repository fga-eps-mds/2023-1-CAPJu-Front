import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Table,
  Tbody,
  Tr,
  Thead,
  Td,
  Skeleton,
  chakra,
  Text,
  Box,
  useToast,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { DataTable } from "components/DataTable";

import { useState, ReactNode, useEffect } from "react";
import { useQuery } from "react-query";
import { Pagination } from "components/Pagination";

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowUpIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "hooks/useAuth";
import { getSequencesSortedStagesIds } from "utils/sorting";
import { labelByProcessStatus } from "utils/constants";
import { getProcesses } from "../../services/processManagement/processes";
import { ActionButton } from "../DataTable/ActionButton";

export type DataFlowProps<DataFlow extends object> = {
  data: (DataFlow & { actionsProps: any })[];
  columns: ColumnDef<DataFlow & { actionsProps: any }, any>[];
  isDataFetching?: boolean;
  skeletonHeight?: string | number;
  width?: string | number;
  maxWidth?: string | number;
  size?: string | string[];
  emptyTableMessage?: string;
  rawData?: any;
};

export function FlowAccordion<DataFlow extends object>({
  data,
  columns,
  isDataFetching = false,
  skeletonHeight = 272,
  width = "100%",
  maxWidth = 1120,
  size = ["sm", "md"],
  emptyTableMessage = "Esta tabela está vazia no momento.",
  rawData,
}: DataFlowProps<DataFlow>) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });
  const { state } = useLocation();
  const flow = state?.flow;
  const legalPriority = useState(0);
  const showFinished = useState(false);
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
    queryKey: ["processes"],
    queryFn: async () => {
      const res = await getProcesses(
        undefined,
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
  });

  const processesTableRows = (
    dataFlow: DataFlow & { actionsProps: any }
  ): TableRow<Process>[] => {
    if (!isProcessesFetched || processesData?.value === undefined) {
      return [];
    }

    const { idFlow } = dataFlow.actionsProps.flow;
    const processes = processesData?.value?.filter(
      (process) => process.idFlow === idFlow
    );
    console.log(processes);

    return (
      (processes?.reduce(
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
  };

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
  ];

  useEffect(() => {
    refetchProcesses();
  }, [currentPage, showFinished, legalPriority]);

  return isDataFetching ? (
    <Skeleton w={width} maxW={maxWidth} h={skeletonHeight} />
  ) : (
    <Table
      bg="white"
      w={width}
      maxW={maxWidth}
      borderRadius="4"
      size={size}
      border="hidden"
    >
      <Thead width={maxWidth}>
        {table.getHeaderGroups().map((headerGroup) => (
          <Tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const { meta } = header.column.columnDef;
              return (
                <Td
                  key={header.id}
                  onClick={
                    meta?.isSortable
                      ? header.column.getToggleSortingHandler()
                      : undefined
                  }
                  textAlign={meta?.isTableActions ? "end" : "start"}
                  cursor={meta?.isSortable ? "pointer" : "default"}
                  fontWeight="bold"
                  color="gray.600"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() ? (
                    <chakra.span pl="1">
                      {header.column.getIsSorted() === "desc" ? (
                        <ChevronDownIcon
                          boxSize="4"
                          aria-label="Ordenado de maneira decrescente"
                        />
                      ) : (
                        <ChevronUpIcon
                          boxSize="4"
                          aria-label="Ordenado de maneira crescente"
                        />
                      )}
                    </chakra.span>
                  ) : null}
                </Td>
              );
            })}
          </Tr>
        ))}
      </Thead>
      <Tbody w={maxWidth}>
        {!data?.length ? (
          <Tr>
            <Td colSpan={columns.length}>
              <Text textAlign="center" py="4">
                {emptyTableMessage}
              </Text>
            </Td>
          </Tr>
        ) : (
          <>
            {table.getRowModel().rows.map((row, index) => (
              <Tr key={row.id}>
                <Td colSpan={2} padding="5px !important" w={maxWidth}>
                  <Accordion allowMultiple maxWidth="100%">
                    <AccordionItem w="100%" maxWidth="100%" border="hidden">
                      <AccordionButton
                        justifyContent="flex-start"
                        borderRadius="8px"
                        w="100%"
                      >
                        <AccordionIcon marginLeft="0%" mr="1%" />
                        {row
                          .getVisibleCells()
                          .map(({ id, column, getValue }) => {
                            const { meta } = column.columnDef;
                            const isLastRow =
                              table.getRowModel().rows?.length - 1 === index;
                            const value = getValue();
                            return meta?.isTableActions ? (
                              <Box
                                key={id}
                                display="flex"
                                borderBottomWidth={isLastRow ? 0 : 0}
                                maxW="20%"
                              >
                                {(value as TableAction[])?.map(
                                  (actionItem: TableAction) => {
                                    const disabled =
                                      actionItem.disabled ||
                                      (actionItem.disabledOn &&
                                        actionItem.disabledOn(rawData[index]));
                                    const label = disabled
                                      ? actionItem.labelOnDisable ||
                                        actionItem.label
                                      : actionItem.label;
                                    actionItem = { ...actionItem, label };
                                    return (
                                      <ActionButton
                                        key={actionItem.label}
                                        disabled={disabled}
                                        {...actionItem}
                                        action={() => {
                                          if (actionItem.action)
                                            actionItem.action(
                                              row.original.actionsProps
                                            );

                                          if (
                                            row.original.actionsProps
                                              .pathname &&
                                            actionItem.isNavigate
                                          )
                                            navigate(
                                              row.original.actionsProps
                                                .pathname,
                                              {
                                                state:
                                                  row.original.actionsProps
                                                    .state,
                                              }
                                            );
                                        }}
                                      />
                                    );
                                  }
                                )}
                              </Box>
                            ) : (
                              <Flex
                                key={id}
                                borderBottomWidth={isLastRow ? 0 : 0}
                                w="100%"
                                justifyContent="start"
                              >
                                {value as ReactNode}
                              </Flex>
                            );
                          })}
                      </AccordionButton>
                      <AccordionPanel maxWidth="100%">
                        <Flex
                          flexDir="column"
                          alignItems="center"
                          marginTop="2%"
                        >
                          <DataTable
                            data={processesTableRows(data[Number(row.id)])}
                            columns={tableColumns}
                            isDataFetching={
                              !isProcessesFetched || !isUserFetched
                            }
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
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Td>
              </Tr>
            ))}
          </>
        )}
      </Tbody>
    </Table>
  );
}
