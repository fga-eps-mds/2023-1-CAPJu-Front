import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import {
  Flex,
  useToast,
  Text,
  Button,
  useDisclosure,
  chakra,
} from "@chakra-ui/react";
import { MdDelete, MdEdit } from "react-icons/md";
import { AddIcon, Icon, ViewIcon, SearchIcon } from "@chakra-ui/icons";
import { createColumnHelper } from "@tanstack/react-table";

import { PrivateLayout } from "layouts/Private";
import { getFlows } from "services/processManagement/flows";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { isActionAllowedToUser } from "utils/permissions";
import { Pagination } from "components/Pagination";
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
  const [currentPage, setCurrentPage] = useState(0);
  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };
  const {
    data: flowsData,
    isFetched: isFlowsFetched,
    refetch: refetchFlows,
  } = useQuery({
    queryKey: ["flows"],
    queryFn: async () => {
      const res = await getFlows({ offset: currentPage * 5, limit: 5 }, filter);

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
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

  const tableActions = useMemo<TableAction[]>(
    () => [
      {
        label: "Visualizar Processos do Fluxo",
        icon: <ViewIcon boxSize={4} />,
        isNavigate: true,
        actionName: "see-flow",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "see-flow"
        ),
      },
      {
        label: "Editar Fluxo",
        icon: <Icon as={MdEdit} boxSize={4} />,
        action: ({ flow }: { flow: Flow }) => {
          selectFlow(flow);
          onEditionOpen();
        },
        actionName: "edit-flow",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "edit-flow"
        ),
      },
      {
        label: "Excluir Fluxo",
        actionName: "delete-flow",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: ({ flow }: { flow: Flow }) => {
          selectFlow(flow);
          onDeleteOpen();
        },
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "delete-flow"
        ),
      },
    ],
    [isFlowsFetched, isUserFetched, userData]
  );

  const filteredFlows = useMemo<TableRow<Flow>[]>(() => {
    if (!isFlowsFetched) return [];

    const value = flowsData?.value;

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

  useEffect(() => {
    refetchFlows();
  }, [currentPage]);

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
            isDisabled={
              !isActionAllowedToUser(
                userData?.value?.allowedActions || [],
                "create-flow"
              )
            }
            onClick={onCreationOpen}
          >
            <AddIcon mr="2" boxSize={3} /> Criar Fluxo
          </Button>
        </Flex>
        <Flex justifyContent="flex-start" w="100%">
          <chakra.form
            onSubmit={(e) => {
              e.preventDefault();
              refetchFlows();
            }}
            w="100%"
            display="flex"
            flexDirection="row"
          >
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
            <Button
              aria-label="botão de busca"
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
        data={filteredFlows}
        columns={tableColumns}
        isDataFetching={!isFlowsFetched || !isUserFetched}
        emptyTableMessage="Não foram encontrados fluxos."
      />
      {flowsData?.totalPages !== undefined ? (
        <Pagination
          pageCount={flowsData?.totalPages}
          onPageChange={handlePageChange}
        />
      ) : null}
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
