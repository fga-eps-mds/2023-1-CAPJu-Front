import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, Text, useDisclosure } from "@chakra-ui/react";
import { DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import { createColumnHelper } from "@tanstack/react-table";

import { PrivateLayout } from "layouts/Private";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { hasPermission } from "utils/permissions";
import { getUsersRequests } from "services/user";
import { AcceptModal } from "./AcceptModal";
import { DenyModal } from "./DenyModal";

function Requests() {
  // const toast = useToast();
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
    data: requestsData,
    isFetched: isRequestsFetched,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["requests"],
    queryFn: getUsersRequests,
  });
  const isActionDisabled = (actionName: string) =>
    userData?.value ? !hasPermission(userData.value, actionName) : true;
  const tableActions = useMemo(
    () => [
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
        icon: <DeleteIcon boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onDenyOpen();
        },
        actionName: "delete-user",
        disabled: isActionDisabled("delete-user"),
      },
    ],
    []
  );
  const requests = useMemo<TableRow<User>[]>(() => {
    if (!isRequestsFetched) return [];

    return (
      (requestsData?.value?.reduce(
        (acc: TableRow<User>[] | User[], curr: TableRow<User> | User) => {
          if (!curr.fullName.toLowerCase().includes(filter.toLowerCase()))
            return acc;

          return [
            ...acc,
            { ...curr, tableActions, actionsProps: { user: curr } },
          ];
        },
        []
      ) as TableRow<User>[]) || []
    );
  }, [requestsData, isRequestsFetched, filter]);

  const tableColumnHelper = createColumnHelper<TableRow<User>>();
  const tableColumns = [
    tableColumnHelper.accessor("fullName", {
      cell: (info) => info.getValue(),
      header: "Nomes",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("role", {
      cell: (info) => info.getValue(),
      header: "Perfis",
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

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Solicitações
          </Text>
        </Flex>
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Input
            placeholder="Pesquisar usuário pelo nome"
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
        data={requests}
        columns={tableColumns}
        isDataFetching={!isRequestsFetched || !isUserFetched}
        emptyTableMessage="Não foram encontradas solicitações no momento."
      />
      {userData?.value && selectedUser && isAcceptOpen ? (
        <AcceptModal
          isOpen={isAcceptOpen}
          onClose={onAcceptClose}
          user={selectedUser}
          refetch={refetchRequests}
        />
      ) : null}
      {userData?.value && selectedUser && isDenyOpen ? (
        <DenyModal
          isOpen={isDenyOpen}
          onClose={onDenyClose}
          user={selectedUser}
          refetch={refetchRequests}
        />
      ) : null}
    </PrivateLayout>
  );
}

export default Requests;
