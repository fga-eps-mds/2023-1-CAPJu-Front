import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, useToast, Text, Button, useDisclosure } from "@chakra-ui/react";
import { MdDelete, MdEdit } from "react-icons/md";
import { AddIcon, Icon, ViewIcon } from "@chakra-ui/icons";
import { createColumnHelper } from "@tanstack/react-table";
import ReactPaginate from "react-paginate";

import { PrivateLayout } from "layouts/Private";
import { getFlows } from "services/flows";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { hasPermission } from "utils/permissions";
import { DeletionModal } from "./DeletionModal";
import { CreationModal } from "./CreationModal";
import { EditionModal } from "./EditionModal";

function Flows() {
  const toast = useToast();
  const [selectedFlow, selectFlow] = useState<Flow | null>(null);
  const [filter, setFilter] = useState<string>("");
  const { getUserData } = useAuth();
  const {
    isOpen: isCreationOpen,
    onOpen: onCreationOpen,
    onClose: onCreationClose,
  } = useDisclosure();
  const {
    isOpen: isEditionOpen,
    onOpen: onEditionOpen,
    onClose: onEditionClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    data: flowsData,
    isFetched: isFlowsFetched,
    refetch: refetchFlows,
  } = useQuery({
    queryKey: ["flows"],
    queryFn: getFlows,
    onError: () => {
      toast({
        id: "flows-error",
        title: "Erro ao carregar fluxos",
        description:
          "Houve um erro ao carregar fluxos, favor tentar novamente.",
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
  const tableActions = useMemo<TableAction[]>(
    () => [
      {
        label: "Visualizar Processos do Fluxo",
        icon: <ViewIcon boxSize={4} />,
        isNavigate: true,
        actionName: "view-flow",
        disabled: isActionDisabled("view-flow"),
      },
      {
        label: "Editar Fluxo",
        icon: <Icon as={MdEdit} boxSize={4} />,
        action: ({ flow }: { flow: Flow }) => {
          selectFlow(flow);
          onEditionOpen();
        },
        actionName: "edit-flow",
        disabled: isActionDisabled("edit-flow"),
      },
      {
        label: "Deletar Fluxo",
        actionName: "delete-flow",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: ({ flow }: { flow: Flow }) => {
          selectFlow(flow);
          onDeleteOpen();
        },
        disabled: isActionDisabled("delete-flow"),
      },
    ],
    [isFlowsFetched, isUserFetched, userData]
  );

  const filteredFlows = useMemo<TableRow<Flow>[]>(() => {
    if (!isFlowsFetched) return [];

    const value =
      filter !== ""
        ? flowsData?.value?.filter((unit) =>
            unit.name.toLowerCase().includes(filter.toLocaleLowerCase())
          )
        : flowsData?.value;

    return (
      (value?.reduce(
        (acc: TableRow<Flow>[] | Flow[], curr: TableRow<Flow> | Flow) => [
          ...acc,
          {
            ...curr,
            tableActions,
            actionsProps: {
              flow: curr,
              state: { flow: curr },
              pathname: `/processos`,
            },
          },
        ],
        []
      ) as TableRow<Flow>[]) || []
    );
  }, [
    flowsData,
    filter,
    isFlowsFetched,
    tableActions,
    isUserFetched,
    userData,
  ]);

  const tableColumnHelper = createColumnHelper<TableRow<Flow>>();
  const tableColumns = [
    tableColumnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Nome",
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

  const [itemsPerPage, setItemsPerPage] = useState(2); // Define a quantidade de itens por página
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  const pageCount = Math.ceil(filteredFlows.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredFlows.slice(offset, offset + itemsPerPage);

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Fluxos
          </Text>
          <Button
            size="xs"
            fontSize="sm"
            colorScheme="green"
            isDisabled={isActionDisabled("create-flow")}
            onClick={onCreationOpen}
          >
            <AddIcon mr="2" boxSize={3} /> Criar Fluxo
          </Button>
        </Flex>
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Input
            placeholder="Pesquisar fluxos"
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
        <Flex alignItems="center">
          <Text mr="2">Itens por página:</Text>
          {[2, 4, 6].map((option) => (
            <Button
              key={option}
              size="sm"
              colorScheme={itemsPerPage === option ? "blue" : "gray"}
              onClick={() => setItemsPerPage(option)}
              mr="1"
            >
              {option}
            </Button>
          ))}
        </Flex>
      </Flex>
      <DataTable
        data={currentItems}
        columns={tableColumns}
        isDataFetching={!isFlowsFetched || !isUserFetched}
        emptyTableMessage="Não foram encontrados fluxos."
      />
      <ReactPaginate
        previousLabel="Anterior"
        nextLabel="Próximo"
        pageCount={pageCount}
        onPageChange={handlePageChange}
        containerClassName="pagination"
        previousLinkClassName="pagination__link"
        nextLinkClassName="pagination__link"
        disabledClassName="pagination__link--disabled"
        activeClassName="pagination__link--active"
      />
      {selectedFlow && isEditionOpen ? (
        <EditionModal
          flow={selectedFlow}
          isOpen={isEditionOpen}
          onClose={onEditionClose}
          afterSubmission={refetchFlows}
        />
      ) : null}
      {userData?.value?.idUnit && isCreationOpen ? (
        <CreationModal
          isOpen={isCreationOpen}
          onClose={onCreationClose}
          idUnit={userData?.value?.idUnit}
          afterSubmission={refetchFlows}
        />
      ) : null}
      {selectedFlow && isDeleteOpen ? (
        <DeletionModal
          flow={selectedFlow}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
          refetchFlows={refetchFlows}
        />
      ) : null}
    </PrivateLayout>
  );
}

export default Flows;
