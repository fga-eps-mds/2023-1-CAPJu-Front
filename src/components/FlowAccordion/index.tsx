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
} from "@chakra-ui/react";

import { useState, ReactNode } from "react";

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

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

  return isDataFetching ? (
    <Skeleton w={width} maxW={maxWidth} h={skeletonHeight} />
  ) : (
    <Table bg="white" w={width} maxW={maxWidth} borderRadius="4" size={size}>
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
              <Tr key={row.id} w={maxWidth}>
                <Accordion allowMultiple>
                  <AccordionItem w="132.7%">
                    <AccordionButton justifyContent="space-between">
                      <AccordionIcon marginLeft="0%" />
                      {row.getVisibleCells().map(({ id, column, getValue }) => {
                        const { meta } = column.columnDef;
                        const isLastRow =
                          table.getRowModel().rows?.length - 1 === index;
                        const value = getValue();
                        console.log(value);
                        return meta?.isTableActions ? (
                          <Box
                            key={id}
                            display="flex"
                            borderBottomWidth={isLastRow ? 0 : 0}
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
                                        row.original.actionsProps.pathname &&
                                        actionItem.isNavigate
                                      )
                                        navigate(
                                          row.original.actionsProps.pathname,
                                          {
                                            state:
                                              row.original.actionsProps.state,
                                          }
                                        );
                                    }}
                                  />
                                );
                              }
                            )}
                          </Box>
                        ) : (
                          <Td
                            key={id}
                            borderBottomWidth={isLastRow ? 0 : 0}
                            boxSize="50%"
                            marginRight="75%"
                            alignItems="start"
                          >
                            {value as ReactNode}
                          </Td>
                        );
                      })}
                    </AccordionButton>
                    <AccordionPanel pb={4} width="100%">
                      INFO DOS PROCESSOS DENTRO DESTE FLUXO
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Tr>
            ))}
          </>
        )}
      </Tbody>
    </Table>
  );
}
