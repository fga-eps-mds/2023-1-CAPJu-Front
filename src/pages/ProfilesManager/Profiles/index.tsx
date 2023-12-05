import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, Text, Button, useDisclosure, chakra } from "@chakra-ui/react";
import { Icon, ViewIcon, SearchIcon } from "@chakra-ui/icons";

import { MdEdit, MdDelete } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";

import { DataTable } from "components/DataTable";
import { getAcceptedUsers } from "services/user";
import { getAllRoles } from "services/role";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { isActionAllowedToUser } from "utils/permissions";
import { getUnits } from "services/unit";
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
          offset: currentPage * 10,
          limit: 10,
        },
        filter
      );

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
    refetchOnWindowFocus: false,
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
    refetchOnWindowFocus: false,
  });
  const { data: unitsData, isFetched: isUnitsFetched } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await getUnits();

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
    refetchOnWindowFocus: false,
  });
  const { data: rolesData, isFetched: isRolesFetched } = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
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
          "see-profile"
        ),
      },
      {
        label: "Editar Usuário",
        icon: <Icon as={MdEdit} boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onEditOpen();
        },
        actionName: "edit-user",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "edit-profile"
        ),
      },
      {
        label: "Excluir Usuário",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: ({ user }: { user: User }) => {
          selectUser(user);
          onDeleteOpen();
        },
        actionName: "delete-user",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "delete-profile"
        ),
      },
    ],
    [isUserFetched, userData]
  );
  const users = useMemo<TableRow<User>[]>(() => {
    if (!isUsersFetched || !isUnitsFetched || !isRolesFetched) return [];

    return (
      // @ts-ignore
      (usersData?.value?.reduce(
        // @ts-ignore
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
      <Flex w="90%" maxW={1140} flexDir="column" gap="3" mb="4" mt="50px">
        <Flex w="50%" mb="3" justifyContent="start">
          <Text fontSize="25px" fontWeight="semibold">
            Perfil de acesso
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
