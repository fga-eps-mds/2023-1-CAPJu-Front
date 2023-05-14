import { useState, ReactNode } from "react";
import {
  Table,
  Tbody,
  Tr,
  Thead,
  Td,
  Skeleton,
  chakra,
  Text,
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
  data: (Data & { actionsProps: any })[];
  columns: ColumnDef<Data & { actionsProps: any }, any>[];
  isDataFetching?: boolean;
  skeletonHeight?: string | number;
  width?: string | number;
  maxWidth?: string | number;
  size?: string | string[];
  emptyTableMessage?: string;
};

export function DataTable<Data extends object>({
  data,
  columns,
  isDataFetching = false,
  skeletonHeight = 272,
  width = "90%",
  maxWidth = 1120,
  size = ["sm", "md"],
  emptyTableMessage = "Esta tabela está vazia no momento.",
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
    <Skeleton w={width} maxW={maxWidth} h={skeletonHeight} />
  ) : (
    <Table bg="white" w={width} maxW={maxWidth} borderRadius="4" size={size}>
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
                {row.getVisibleCells().map(({ id, column, getValue }) => {
                  const { meta } = column.columnDef;
                  const isLastRow =
                    table.getRowModel().rows?.length - 1 === index;
                  const value = getValue();

                  return meta?.isTableActions ? (
                    <Td
                      key={id}
                      display="flex"
                      justifyContent="end"
                      borderBottomWidth={isLastRow ? 0 : 1}
                    >
                      {(value as TableAction[])?.map(
                        (actionItem: TableAction) => {
                          return (
                            <ActionButton
                              key={actionItem.label}
                              {...actionItem}
                              action={() =>
                                actionItem.action(row.original.actionsProps)
                              }
                            />
                          );
                        }
                      )}
                    </Td>
                  ) : (
                    <Td key={id} borderBottomWidth={isLastRow ? 0 : 1}>
                      {value as ReactNode}
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </>
        )}
      </Tbody>
    </Table>
  );
}