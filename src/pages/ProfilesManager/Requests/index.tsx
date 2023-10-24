import { useMemo, useState, useEffect } from "react";
import { useQuery } from "react-query";
import { Flex, Text, Button, useDisclosure, chakra } from "@chakra-ui/react";
import { Icon, CheckIcon, ViewIcon, SearchIcon } from "@chakra-ui/icons";
import { MdDelete } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";

import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { isActionAllowedToUser } from "utils/permissions";
import { getUnits } from "services/unit";
import { Pagination } from "components/Pagination";
import { getUsersRequests } from "services/user";
import { AcceptModal } from "./AcceptModal";
import { DenyModal } from "./DenyModal";
import { ViewModal } from "./ViewModal";

export function Requests() {
  const [filter, setFilter] = useState<string>("");
  const [selectedUser, selectUser] = useState<User | null>(null);
  const { getUserData } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };
  const {
    data: requestsData,
    isFetched: isRequestsFetched,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const res = await getUsersRequests(
        {
          offset: 5 * currentPage,
          limit: 5,
        },
        filter
      );

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
    refetchOnWindowFocus: false,
  });
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
    refetchOnWindowFocus: false,
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
    queryFn: async () => {
      const res = await getUnits();

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
    refetchOnWindowFocus: false,
  });

  const tableActions = useMemo(
    () => [
      {
        label: "Visualizar Usuário",
        icon: <ViewIcon boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onViewOpen();
        },
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "see-request"
        ),
      },
      {
        label: "Aceitar Usuário",
        icon: <CheckIcon boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onAcceptOpen();
        },
        actionName: "accept-request",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "accept-request"
        ),
      },
      {
        label: "Excluir Solicitação",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onDenyOpen();
        },
        actionName: "delete-request",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "delete-request"
        ),
      },
    ],
    [isUserFetched, userData]
  );
  const requests = useMemo<TableRow<User>[]>(() => {
    if (!isRequestsFetched || !isUnitsFetched) return [];

    return (
      (requestsData?.value?.reduce(
        (acc: TableRow<User>[] | User[], curr: TableRow<User> | User) => {
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

  useEffect(() => {
    refetchRequests();
    refetchUnits();
  }, [currentPage]);

  return (
    <>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4" style={{ marginTop: '30px ' }}>
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Solicitações
          </Text>
        </Flex>
        <Flex justifyContent="flex-start" w="100%">
          <chakra.form
            onSubmit={(e) => {
              e.preventDefault();
              refetchRequests();
            }}
            w="100%"
            display="flex"
            flexDirection="row"
          >
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
            <Button
              colorScheme="green"
              marginLeft="2"
              justifyContent="center"
              type="submit"
            >
              <SearchIcon boxSize={4} />
            </Button>
          </chakra.form>
        </Flex>
      </Flex>
      <DataTable
        data={requests}
        columns={
          userData?.value?.idRole !== 5
            ? tableColumns.filter((_, index) => index !== 1)
            : tableColumns
        }
        isDataFetching={!isRequestsFetched || !isUserFetched}
        emptyTableMessage="Não foram encontradas solicitações no momento."
      />
      {requestsData?.totalPages ? (
        <Pagination
          pageCount={requestsData?.totalPages}
          onPageChange={handlePageChange}
        />
      ) : null}
      {userData?.value && selectedUser && isAcceptOpen ? (
        <AcceptModal
          isOpen={isAcceptOpen}
          onClose={onAcceptClose}
          user={selectedUser}
          refetch={() => refetchRequests()}
        />
      ) : null}
      {userData?.value && selectedUser && isDenyOpen ? (
        <DenyModal
          isOpen={isDenyOpen}
          onClose={onDenyClose}
          user={selectedUser}
          refetch={() => refetchRequests()}
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
