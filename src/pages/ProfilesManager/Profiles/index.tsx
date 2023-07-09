import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, Text, Button, useDisclosure, chakra } from "@chakra-ui/react";
import { Icon, ViewIcon, SearchIcon } from "@chakra-ui/icons";

import { MdEdit, MdDelete } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";

import { DataTable } from "components/DataTable";
import { getAcceptedUsers, getAllRoles } from "services/user";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { hasPermission } from "utils/permissions";
import { getUnits } from "services/units";
import { Pagination } from "components/Pagination";
import { DeletionModal } from "./DeletionModal";
import { EditionModal } from "./EditionModal";
import { ViewModal } from "./ViewModal";

export function Profiles() {
  const [filter, setFilter] = useState<string>("");
  const [selectedUser, selectUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };
  const {
    data: usersData,
    isFetched: isUsersFetched,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["accepted-users"],
    queryFn: async () => {
      const res = await getAcceptedUsers(
        {
          offset: currentPage * 5,
          limit: 5,
        },
        filter
      );

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
  });
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const { getUserData } = useAuth();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const { data: unitsData, isFetched: isUnitsFetched } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await getUnits();

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
  });
  const { data: rolesData, isFetched: isRolesFetched } = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
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
        label: "Editar Usuário",
        icon: <Icon as={MdEdit} boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onEditOpen();
        },
        actionName: "edit-user",
        disabled: isActionDisabled("accept-user"),
      },
      {
        label: "Excluir Usuário",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onDeleteOpen();
        },
        actionName: "delete-user",
        disabled: isActionDisabled("delete-user"),
      },
    ],
    [isUserFetched, userData]
  );
  const users = useMemo<TableRow<User>[]>(() => {
    if (!isUsersFetched || !isUnitsFetched || !isRolesFetched) return [];

    return (
      (usersData?.value?.reduce(
        (acc: TableRow<User>[] | User[], curr: TableRow<User> | User) => {
          const role =
            rolesData?.value?.find((i) => i.idRole === curr.idRole)?.name ||
            "-";

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
    isRolesFetched,
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
    refetchUsers();
  }, [currentPage]);

  return (
    <>
      <Flex mt="4" w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Perfil de Acesso
          </Text>
        </Flex>
        <Flex justifyContent="flex-start" w="100%">
          <chakra.form
            onSubmit={(e) => {
              e.preventDefault();
              refetchUsers();
            }}
            w="100%"
            display="flex"
            flexDirection="row"
          >
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
        data={users}
        columns={
          userData?.value?.idRole !== 5
            ? tableColumns.filter((_, index) => index !== 1)
            : tableColumns
        }
        isDataFetching={!isUsersFetched || !isUnitsFetched || !isRolesFetched}
        emptyTableMessage="Não há usuários cadastrados"
      />
      {usersData?.totalPages ? (
        <Pagination
          pageCount={usersData?.totalPages}
          onPageChange={handlePageChange}
        />
      ) : null}
      {userData?.value && selectedUser && isEditOpen && (
        <EditionModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          user={selectedUser}
          refetch={refetchUsers}
        />
      )}
      {userData?.value && selectedUser && isViewOpen && (
        <ViewModal
          isOpen={isViewOpen}
          onClose={onViewClose}
          user={selectedUser}
        />
      )}
      {userData?.value && selectedUser && isDeleteOpen && (
        <DeletionModal
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          user={selectedUser}
          refetch={refetchUsers}
        />
      )}
    </>
  );
}
