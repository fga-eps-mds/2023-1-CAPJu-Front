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

interface UnitTableRow extends Unit {
  tableActions: TableAction[];
  actionsProps: any;
}

function Units() {
  const toast = useToast();
  const [filter, setFilter] = useState<string>("");
  const { getUserData } = useAuth();
  const {
    isOpen: isCreationOpen,
    onOpen: onCreationOpen,
    onClose: onCreationClose,
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
  const { data: userData } = useQuery({
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
        action: () => {},
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
  const filteredUnits = useMemo<UnitTableRow[]>(() => {
    if (!isFetched) return [];

    const value =
      filter !== ""
        ? data?.value?.filter((unit) =>
            unit.name.toLowerCase().includes(filter.toLocaleLowerCase())
          )
        : data?.value;

    return (
      (value?.reduce(
        (acc: UnitTableRow[] | Unit[], curr: UnitTableRow | Unit) => [
          ...acc,
          { ...curr, tableActions },
        ],
        []
      ) as UnitTableRow[]) || []
    );
  }, [data, filter, isFetched]);

  const tableColumnHelper = createColumnHelper<UnitTableRow>();
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
        isDataFetching={!isFetched}
      />
      <CreationModal
        isOpen={isCreationOpen}
        onClose={onCreationClose}
        afterSubmission={refetch}
      />
    </PrivateLayout>
  );
}

export default Units;
