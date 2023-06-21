import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, useToast, Text, Button, useDisclosure } from "@chakra-ui/react";
import { AddIcon, Icon } from "@chakra-ui/icons";
import { MdDelete, MdEdit } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";

import { PrivateLayout } from "layouts/Private";
import { getUnits } from "services/units";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { hasPermission } from "utils/permissions";
import { Pagination } from "components/Pagination";
import { CreationModal } from "./CreationModal";
import { DeletionModal } from "./DeletionModal";
import { EditionModal } from "./EditionModal";

import "components/Pagination/style.css";

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
    isOpen: isDeletionOpen,
    onOpen: onDeletionOpen,
    onClose: onDeletionClose,
  } = useDisclosure();
  const {
    isOpen: isEditionOpen,
    onOpen: onEditionOpen,
    onClose: onEditionClose,
  } = useDisclosure();
  const [currentPage, setCurrentPage] = useState(0);
  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };
  const {
    data: unitsData,
    isFetched: isUnitsFetched,
    refetch: refetchUnits,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await getUnits({ offset: currentPage * 5, limit: 5 });
      return res;
    },
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
        label: "Editar Unidade",
        icon: <Icon as={MdEdit} boxSize={4} />,
        action: ({ unit }: { unit: Unit }) => {
          selectUnit(unit);
          onEditionOpen();
        },
        actionName: "edit-unit",
        disabled: isActionDisabled("edit-unit"),
      },
      {
        label: "Excluir Unidade",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: ({ unit }: { unit: Unit }) => {
          selectUnit(unit);
          onDeletionOpen();
        },
        actionName: "delete-unit",
        disabled: isActionDisabled("delete-unit"),
      },
    ],
    [isUnitsFetched, isUserFetched, userData]
  );
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
  }, [
    unitsData,
    filter,
    isUnitsFetched,
    isUserFetched,
    userData,
    tableActions,
  ]);

  const tableColumnHelper = createColumnHelper<TableRow<Unit>>();
  const tableColumns = [
    tableColumnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Unidade",
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
  const pageCount = useMemo(() => {
    return unitsData?.totalPages;
  }, [unitsData]);

  useEffect(() => {
    refetchUnits();
  }, [currentPage]);

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
      {selectedUnit ? (
        <DeletionModal
          unit={selectedUnit}
          isOpen={isDeletionOpen}
          onClose={onDeletionClose}
          refetchUnits={refetchUnits}
        />
      ) : null}
      {selectedUnit ? (
        <EditionModal
          unit={selectedUnit}
          isOpen={isEditionOpen}
          onClose={onEditionClose}
          afterSubmission={refetchUnits}
        />
      ) : null}
      {pageCount !== undefined ? (
        <Pagination pageCount={pageCount} onPageChange={handlePageChange} />
      ) : null}
    </PrivateLayout>
  );
}

export default Units;
