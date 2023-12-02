import { Flex } from "@chakra-ui/react";
import { DataTable } from "components/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { Pagination } from "components/Pagination";

import { useMemo } from "react";
import { ViewIcon } from "@chakra-ui/icons";
import { isActionAllowedToUser } from "utils/permissions";
import { labelByProcessStatus } from "utils/constants";

// import { Container } from './styles';

interface IProcessTableProps {
  userData?: Result<
    User & {
      allowedActions: string[];
    }
  >;
  isUserFetched: boolean;
  isFetching: boolean;
  processData: null | ResultSuccess<Process[]>;
  flows?: Flow[];
  state: any;
  // eslint-disable-next-line no-unused-vars
  handlePageChange: (selectedPage: { selected: number }) => void;
  tableVisible: boolean;
  key: number;
}

const ProcessTable = ({
  userData,
  isUserFetched,
  isFetching,
  processData,
  flows,
  state,
  handlePageChange,
  tableVisible,
  key,
}: IProcessTableProps): JSX.Element => {
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

  const filteredProcesses = useMemo((): TableRow<Process>[] => {
    if (isFetching) return [];
    return (
      (processData?.value?.reduce(
        (
          acc: TableRow<Process>[] | Process[],
          curr: TableRow<Process> | Process
        ) => {
          const currFlow = flows?.find(
            (item) =>
              item?.idFlow === ((curr?.idFlow as number[])[0] || curr?.idFlow)
          ) as Flow;
          return [
            ...acc,
            {
              ...curr,
              tableActions,
              actionsProps: {
                process: curr,
                pathname: `/processos/${curr.idProcess}`,
                state: { process: curr, ...(state || {}) },
              },
              flowName: currFlow?.name,
              // @ts-ignore
              status: labelByProcessStatus[curr.status],
            },
          ];
        },
        []
      ) as TableRow<Process>[]) || []
    );
  }, [processData]);

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
    tableColumnHelper.accessor("flowName", {
      cell: (info) => info.getValue(),
      header: "Fluxo",
      meta: {
        isSortable: true,
      },
    }),
  ];

  return (
    <Flex w="100%" marginTop="15" alignItems="center" flexDirection="column">
      {tableVisible && (
        <DataTable
          data={filteredProcesses}
          columns={tableColumns}
          isDataFetching={isFetching || !isUserFetched}
          emptyTableMessage="Não foram encontrados processos"
        />
      )}
      {processData?.totalPages !== undefined && tableVisible && (
        <Pagination
          key={key}
          pageCount={processData?.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </Flex>
  );
};

export default ProcessTable;
