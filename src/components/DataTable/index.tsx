import { useState, ReactNode } from "react";
import {
  Table,
  Tbody,
  Tr,
  Thead,
  Td,
  Skeleton,
  chakra,
} from "@chakra-ui/react";
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

import { ActionButton } from "./ActionButton";

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  isDataFetching?: boolean;
};

export function DataTable<Data extends object>({
  data,
  columns,
  isDataFetching = false,
}: DataTableProps<Data>) {
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
    <Skeleton w="90%" maxW={1120} h="272" />
  ) : (
    <Table bg="white" w="90%" maxW={1120} borderRadius="4">
      <Thead>
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
      <Tbody>
        {table.getRowModel().rows.map((row, index) => (
          <Tr key={row.id}>
            {row.getVisibleCells().map(({ id, column, getValue }) => {
              const { meta } = column.columnDef;
              const isLastRow = table.getRowModel().rows?.length - 1 === index;
              const value = getValue();

              return meta?.isTableActions ? (
                <Td
                  key={id}
                  display="flex"
                  justifyContent="end"
                  borderBottomWidth={isLastRow ? 0 : 1}
                >
                  {(value as TableAction[])?.map((actionItem: TableAction) => (
                    <ActionButton key={actionItem.label} {...actionItem} />
                  ))}
                </Td>
              ) : (
                <Td key={id} borderBottomWidth={isLastRow ? 0 : 1}>
                  {value as ReactNode}
                </Td>
              );
            })}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
