import { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { Flex, useToast, Text, Button, useDisclosure } from "@chakra-ui/react";
import { MdDelete, MdEdit } from "react-icons/md";
import { AddIcon, Icon, ViewIcon } from "@chakra-ui/icons";
import { createColumnHelper } from "@tanstack/react-table";

import { PrivateLayout } from "layouts/Private";
import { getFlows } from "services/flows";
import { DataTable } from "components/DataTable";
import { Input } from "components/FormFields";
import { useAuth } from "hooks/useAuth";
import { hasPermission } from "utils/permissions";
import { DeleteModal } from "./DeleteModal";
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
    [isFlowsFetched, isUserFetched]
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
              pathname: `/fluxos/${curr.idFlow}`,
            },
          },
        ],
        []
      ) as TableRow<Flow>[]) || []
    );
  }, [flowsData, filter, isFlowsFetched]);

  const tableColumnHelper = createColumnHelper<TableRow<Flow>>();
  const tableColumns = [
    tableColumnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Fluxo",
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
      </Flex>
      <DataTable
        data={filteredFlows}
        columns={tableColumns}
        isDataFetching={!isFlowsFetched || !isUserFetched}
        emptyTableMessage="Não foram encontrados fluxos."
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
        <DeleteModal
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