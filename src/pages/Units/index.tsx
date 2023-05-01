import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, useToast, Text, Button, useDisclosure } from "@chakra-ui/react";
import { AddIcon, ViewIcon } from "@chakra-ui/icons";
import { createColumnHelper } from "@tanstack/react-table";

import { PrivateLayout } from "layouts/Private";
import { getUnits } from "services/units";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { hasPermission } from "utils/permissions";
import { CreationModal } from "./CreationModal";
import { AdminsListModal } from "./AdminsListModal";

function Units() {
  const toast = useToast();
  const [selectedUnit, selectUnit] = useState<Unit | null>(null);
  const [filter, setFilter] = useState<string>("");
  const { getUserData } = useAuth();
  const {
    isOpen: isCreationOpen,
    onOpen: onCreationOpen,
    onClose: onCreationClose,
  } = useDisclosure();
  const {
    isOpen: isAdminsListOpen,
    onOpen: onAdminsListOpen,
    onClose: onAdminsListClose,
  } = useDisclosure();
  const { data, isFetched, refetch } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
    onError: () => {
      toast({
        id: "units-error",
        title: "Erro ao carregar unidades",
        description:
          "Houve um erro ao carregar unidades, favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    },
  });
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const isActionDisabled = (actionName: string) =>
    userData?.value ? !hasPermission(userData.value, actionName) : true;
  const tableActions = useMemo(
    () => [
      {
        label: "Visualizar Admins",
        icon: <ViewIcon boxSize={4} />,
        action: ({ unit }: { unit: Unit }) => {
          selectUnit(unit);
          onAdminsListOpen();
        },
        actionName: "view-admins",
        disabled: isActionDisabled("view-admins"),
      },
      {
        label: "Adicionar Admins",
        icon: <AddIcon boxSize={4} />,
        action: () => {},
        actionName: "add-admin-in-unit",
        disabled: isActionDisabled("add-admin-in-unit"),
      },
    ],
    [userData]
  );
  const filteredUnits = useMemo<TableRow<Unit>[]>(() => {
    if (!isFetched) return [];

    const value =
      filter !== ""
        ? data?.value?.filter((unit) =>
            unit.name.toLowerCase().includes(filter.toLocaleLowerCase())
          )
        : data?.value;

    return (
      (value?.reduce(
        (acc: TableRow<Unit>[] | Unit[], curr: TableRow<Unit> | Unit) => [
          ...acc,
          { ...curr, tableActions, actionsProps: { unit: curr } },
        ],
        []
      ) as TableRow<Unit>[]) || []
    );
  }, [data, filter, isFetched]);

  const tableColumnHelper = createColumnHelper<TableRow<Unit>>();
  const tableColumns = [
    tableColumnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Unidades",
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
            Unidades
          </Text>
          <Button
            size="xs"
            fontSize="sm"
            colorScheme="green"
            isDisabled={isActionDisabled("create-unit")}
            onClick={onCreationOpen}
          >
            <AddIcon mr="2" boxSize={3} /> Criar unidade
          </Button>
        </Flex>
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Input
            placeholder="Pesquisar unidades"
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
        data={filteredUnits}
        columns={tableColumns}
        isDataFetching={!isFetched || !isUserFetched}
        emptyTableMessage="Não foram encontradas unidades."
      />
      <CreationModal
        isOpen={isCreationOpen}
        onClose={onCreationClose}
        afterSubmission={refetch}
      />
      {selectedUnit && isAdminsListOpen ? (
        <AdminsListModal
          unit={selectedUnit}
          isOpen={isAdminsListOpen}
          onClose={onAdminsListClose}
        />
      ) : null}
    </PrivateLayout>
  );
}

export default Units;
