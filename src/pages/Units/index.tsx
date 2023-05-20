import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, useToast, Text, Button, useDisclosure } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { createColumnHelper } from "@tanstack/react-table";

import { PrivateLayout } from "layouts/Private";
import { getUnits } from "services/units";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { hasPermission } from "utils/permissions";
import { CreationModal } from "./CreationModal";

function Units() {
  const toast = useToast();
  const [filter, setFilter] = useState<string>("");
  const { getUserData } = useAuth();
  const {
    isOpen: isCreationOpen,
    onOpen: onCreationOpen,
    onClose: onCreationClose,
  } = useDisclosure();
  const {
    data: unitsData,
    isFetched: isUnitsFetched,
    refetch: refetchUnits,
  } = useQuery({
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
  const tableActions = useMemo(() => [], [isUnitsFetched, isUserFetched]);
  const filteredUnits = useMemo<TableRow<Unit>[]>(() => {
    if (!isUnitsFetched) return [];

    const value =
      filter !== ""
        ? unitsData?.value?.filter((unit) =>
            unit.name.toLowerCase().includes(filter.toLocaleLowerCase())
          )
        : unitsData?.value;

    return (
      (value?.reduce(
        (acc: TableRow<Unit>[] | Unit[], curr: TableRow<Unit> | Unit) => [
          ...acc,
          { ...curr, tableActions, actionsProps: { unit: curr } },
        ],
        []
      ) as TableRow<Unit>[]) || []
    );
  }, [unitsData, filter, isUnitsFetched]);

  const tableColumnHelper = createColumnHelper<TableRow<Unit>>();
  const tableColumns = [
    tableColumnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Unidade",
      meta: {
        isSortable: true,
      },
    }),
    // tableColumnHelper.accessor("tableActions", {
    //   cell: (info) => info.getValue(),
    //   header: "Ações",
    //   meta: {
    //     isTableActions: true,
    //     isSortable: false,
    //   },
    // }),
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
            <AddIcon mr="2" boxSize={3} /> Criar Unidade
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
        isDataFetching={!isUnitsFetched || !isUserFetched}
        emptyTableMessage="Não foram encontradas unidades."
      />
      <CreationModal
        isOpen={isCreationOpen}
        onClose={onCreationClose}
        afterSubmission={refetchUnits}
      />
    </PrivateLayout>
  );
}

export default Units;
