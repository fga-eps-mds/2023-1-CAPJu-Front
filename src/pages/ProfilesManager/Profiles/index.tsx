import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, Text } from "@chakra-ui/react";
import { Icon, ViewIcon } from "@chakra-ui/icons";
import { MdEdit, MdDelete } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";

import { useModals } from "contexts/Modals";
import { Modals } from "utils/constants";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { hasPermission } from "utils/permissions";
import { getUnits } from "services/units";
import { roleNameById } from "utils/roles";
import { DeletionModal } from "./DeletionModal";
import { EditionModal } from "./EditionModal";
import { ViewModal } from "./ViewModal";

interface ProfilesProps {
  usersData: Result<User[]> | undefined;
  isUsersFetched: boolean;
  refetchUsers: () => void;
}

export function Profiles({
  usersData,
  isUsersFetched,
  refetchUsers,
}: ProfilesProps) {
  const [filter, setFilter] = useState<string>("");
  const [selectedUser, selectUser] = useState<User | null>(null);
  const { isModalOpen, handleModalOpen, handleModalClose } = useModals();
  const { getUserData } = useAuth();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const { data: unitsData, isFetched: isUnitsFetched } = useQuery({
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
          handleModalOpen(Modals.PROFILES.VISUALIZATION);
        },
        disabled: false,
      },
      {
        label: "Editar Usuário",
        icon: <Icon as={MdEdit} boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          handleModalOpen(Modals.PROFILES.EDITION);
        },
        actionName: "edit-user",
        disabled: isActionDisabled("accept-user"),
      },
      {
        label: "Remover Usuário",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          handleModalOpen(Modals.PROFILES.DELETION);
        },
        actionName: "delete-user",
        disabled: isActionDisabled("delete-user"),
      },
    ],
    [isUserFetched, userData]
  );
  const requests = useMemo<TableRow<User>[]>(() => {
    if (!isUsersFetched || !isUnitsFetched) return [];

    return (
      (usersData?.value?.reduce(
        (acc: TableRow<User>[] | User[], curr: TableRow<User> | User) => {
          if (
            !curr.fullName.toLowerCase().includes(filter.toLowerCase()) ||
            (userData?.value?.idRole &&
              userData?.value?.idRole !== 5 &&
              curr?.idRole <= userData?.value?.idRole)
          )
            return acc;

          const role = roleNameById(curr.idRole);

          return [
            ...acc,
            {
              ...curr,
              unit:
                unitsData?.value?.find((item) => item.idUnit === curr.idUnit)
                  ?.name || "-",
              role,
              tableActions,
              actionsProps: { user: { ...curr, role } },
            },
          ];
        },
        []
      ) as TableRow<User>[]) || []
    );
  }, [
    usersData,
    unitsData,
    isUsersFetched,
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

  return (
    <>
      <Flex mt="4" w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Perfil de Acesso
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
        columns={
          userData?.value?.idRole !== 5
            ? tableColumns.filter((_, index) => index !== 1)
            : tableColumns
        }
        isDataFetching={!isUsersFetched || !isUserFetched}
        emptyTableMessage="Não foram encontrados usuários no momento."
      />
      {userData?.value && selectedUser ? (
        <DeletionModal
          isOpen={isModalOpen(Modals.PROFILES.DELETION)}
          onClose={handleModalClose}
          user={selectedUser}
          refetch={refetchUsers}
        />
      ) : null}
      {userData?.value && selectedUser ? (
        <EditionModal
          isOpen={isModalOpen(Modals.PROFILES.EDITION)}
          onClose={handleModalClose}
          user={selectedUser}
          refetch={refetchUsers}
        />
      ) : null}
      {userData?.value && selectedUser ? (
        <ViewModal
          isOpen={isModalOpen(Modals.PROFILES.VISUALIZATION)}
          onClose={handleModalClose}
          user={selectedUser}
        />
      ) : null}
    </>
  );
}
