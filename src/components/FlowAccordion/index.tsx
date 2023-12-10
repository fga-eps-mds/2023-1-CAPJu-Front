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
  Flex,
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
import FlowData from "./FlowData";

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
                  data-testid={
                    meta?.isSortable
                      ? "sortable-element"
                      : "NotSortable-element"
                  }
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
                          data-testid="sortIcon"
                          boxSize="4"
                          aria-label="Ordenado de maneira decrescente"
                        />
                      ) : (
                        <ChevronUpIcon
                          data-testid="sortIcon"
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
              <Text data-testid="data-0" textAlign="center" py="4">
                {emptyTableMessage}
              </Text>
            </Td>
          </Tr>
        ) : (
          <>
            {table.getRowModel().rows.map((row, index) => (
              <Tr key={row.id}>
                <Td colSpan={2} padding="5px !important" w={maxWidth}>
                  <Accordion allowMultiple maxWidth="100%" id={`${index}`}>
                    <AccordionItem w="100%" maxWidth="100%" border="hidden">
                      {({ isExpanded }) => (
                        <>
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
                                  table.getRowModel().rows?.length - 1 ===
                                  index;
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
                                            actionItem.disabledOn(
                                              rawData[index]
                                            ));
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
                          {isExpanded ? (
                            <AccordionPanel maxWidth="100%">
                              <FlowData data={data[index]} />
                            </AccordionPanel>
                          ) : null}
                        </>
                      )}
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
