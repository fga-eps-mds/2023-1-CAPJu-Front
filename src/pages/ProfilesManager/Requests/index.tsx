import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, Text } from "@chakra-ui/react";
import { Icon, CheckIcon, ViewIcon } from "@chakra-ui/icons";
import { MdDelete } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";

import { useModals } from "contexts/Modals";
import { Modals } from "utils/constants";
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
  const { isModalOpen, handleModalOpen, handleModalClose } = useModals();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
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
          handleModalOpen(Modals.REQUESTS.VISUALIZATION);
        },
        disabled: false,
      },
      {
        label: "Aceitar Usuário",
        icon: <CheckIcon boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          handleModalOpen(Modals.REQUESTS.ACCEPTION);
        },
        actionName: "accept-user",
        disabled: isActionDisabled("accept-user"),
      },
      {
        label: "Recusar Usuário",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          handleModalOpen(Modals.REQUESTS.DENIAL);
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
          if (
            !curr.fullName.toLowerCase().includes(filter.toLowerCase()) ||
            (userData?.value?.idRole &&
              userData?.value?.idRole !== 5 &&
              curr?.idRole <= userData?.value?.idRole)
          )
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
        data={requests}
        columns={
          userData?.value?.idRole !== 5
            ? tableColumns.filter((_, index) => index !== 1)
            : tableColumns
        }
        isDataFetching={!isRequestsFetched || !isUserFetched}
        emptyTableMessage="Não foram encontradas solicitações no momento."
      />
      {userData?.value && selectedUser ? (
        <AcceptModal
          isOpen={isModalOpen(Modals.REQUESTS.ACCEPTION)}
          onClose={handleModalClose}
          user={selectedUser}
          refetch={() => refetchAll()}
        />
      ) : null}
      {userData?.value && selectedUser ? (
        <DenyModal
          isOpen={isModalOpen(Modals.REQUESTS.DENIAL)}
          onClose={handleModalClose}
          user={selectedUser}
          refetch={() => refetchAll()}
        />
      ) : null}
      {userData?.value && selectedUser ? (
        <ViewModal
          isOpen={isModalOpen(Modals.REQUESTS.VISUALIZATION)}
          onClose={handleModalClose}
          user={selectedUser}
        />
      ) : null}
    </>
  );
}
