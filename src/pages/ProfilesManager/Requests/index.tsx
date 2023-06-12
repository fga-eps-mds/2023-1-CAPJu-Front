import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, Text, useDisclosure } from "@chakra-ui/react";
import { Icon, CheckIcon, ViewIcon } from "@chakra-ui/icons";
import { MdDelete } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";
import ReactPaginate from "react-paginate";

import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { hasPermission } from "utils/permissions";
import { getUnits } from "services/units";
import { AcceptModal } from "./AcceptModal";
import { DenyModal } from "./DenyModal";
import { ViewModal } from "./ViewModal";

interface RequestsProps {
  requestsData: Result<User[]> | undefined;
  isRequestsFetched: boolean;
  refetchRequests: () => void;
}

export function Requests({
  requestsData,
  isRequestsFetched,
  refetchRequests,
}: RequestsProps) {
  const [filter, setFilter] = useState<string>("");
  const [selectedUser, selectUser] = useState<User | null>(null);
  const { getUserData } = useAuth();
  const {
    isOpen: isAcceptOpen,
    onOpen: onAcceptOpen,
    onClose: onAcceptClose,
  } = useDisclosure();
  const {
    isOpen: isDenyOpen,
    onOpen: onDenyOpen,
    onClose: onDenyClose,
  } = useDisclosure();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const {
    data: unitsData,
    isFetched: isUnitsFetched,
    refetch: refetchUnits,
  } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });
  const isActionDisabled = (actionName: string) =>
    userData?.value ? !hasPermission(userData.value, actionName) : true;
  const tableActions = useMemo(
    () => [
      {
        label: "Visualizar Usuário",
        icon: <ViewIcon boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onViewOpen();
        },
        disabled: false,
      },
      {
        label: "Aceitar Usuário",
        icon: <CheckIcon boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onAcceptOpen();
        },
        actionName: "accept-user",
        disabled: isActionDisabled("accept-user"),
      },
      {
        label: "Recusar Usuário",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onDenyOpen();
        },
        actionName: "delete-user",
        disabled: isActionDisabled("delete-user"),
      },
    ],
    [isUserFetched, userData]
  );
  const requests = useMemo<TableRow<User>[]>(() => {
    if (!isRequestsFetched || !isUnitsFetched) return [];

    return (
      (requestsData?.value?.reduce(
        (acc: TableRow<User>[] | User[], curr: TableRow<User> | User) => {
          if (!curr.fullName.toLowerCase().includes(filter.toLowerCase()))
            return acc;

          return [
            ...acc,
            {
              ...curr,
              unit:
                unitsData?.value?.find((item) => item.idUnit === curr?.idUnit)
                  ?.name || "-",
              tableActions,
              actionsProps: { user: curr },
            },
          ];
        },
        []
      ) as TableRow<User>[]) || []
    );
  }, [
    requestsData,
    unitsData,
    isRequestsFetched,
    isUnitsFetched,
    filter,
    isUserFetched,
    userData,
    tableActions,
  ]);

  const tableColumnHelper = createColumnHelper<TableRow<User>>();
  const tableColumns = [
    tableColumnHelper.accessor("fullName", {
      cell: (info) => info.getValue(),
      header: "Nome",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("unit", {
      cell: (info) => info.getValue(),
      header: "Unidade",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("role", {
      cell: (info) => info.getValue(),
      header: "Perfil",
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

  function refetchAll() {
    refetchRequests();
    refetchUnits();
  }

  const [itemsPerPage] = useState(2); // Número de itens por página
  const [currentPage, setCurrentPage] = useState(0);
  const offset = currentPage * itemsPerPage;
  const pageCount = Math.ceil(requests.length / itemsPerPage);

  const handlePageChange = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected);
  };

  const paginatedRequests = requests.slice(offset, offset + itemsPerPage);

  return (
    <>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Solicitações
          </Text>
        </Flex>
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Input
            placeholder="Pesquisar usuários por nome"
            value={filter}
            onChange={({ target }) => setFilter(target.value)}
            variant="filled"
            css={{
              "&, &:hover, &:focus": {
                background: "white",
              },
            }}
          />
        </Flex>
      </Flex>
      <DataTable
        data={paginatedRequests}
        columns={
          userData?.value?.idRole !== 5
            ? tableColumns.filter((_, index) => index !== 1)
            : tableColumns
        }
        isDataFetching={!isRequestsFetched || !isUserFetched}
        emptyTableMessage="Não foram encontradas solicitações no momento."
      />
      <ReactPaginate
        previousLabel="Anterior"
        nextLabel="Próximo"
        pageCount={pageCount}
        onPageChange={handlePageChange}
        containerClassName="pagination"
        previousLinkClassName="pagination__link"
        nextLinkClassName="pagination__link"
        disabledClassName="pagination__link--disabled"
        activeClassName="pagination__link--active"
      />
      {userData?.value && selectedUser && isAcceptOpen ? (
        <AcceptModal
          isOpen={isAcceptOpen}
          onClose={onAcceptClose}
          user={selectedUser}
          refetch={() => refetchAll()}
        />
      ) : null}
      {userData?.value && selectedUser && isDenyOpen ? (
        <DenyModal
          isOpen={isDenyOpen}
          onClose={onDenyClose}
          user={selectedUser}
          refetch={() => refetchAll()}
        />
      ) : null}
      {userData?.value && selectedUser && isViewOpen ? (
        <ViewModal
          isOpen={isViewOpen}
          onClose={onViewClose}
          user={selectedUser}
        />
      ) : null}
    </>
  );
}
