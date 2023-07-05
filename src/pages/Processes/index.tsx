import { useState, useMemo, useEffect } from "react";
import { useQuery } from "react-query";
import {
  Flex,
  Text,
  Button,
  useDisclosure,
  Input,
  Checkbox,
  useToast,
  Tooltip,
  chakra,
} from "@chakra-ui/react";
import {
  AddIcon,
  ArrowUpIcon,
  Icon,
  ViewIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { MdDelete, MdEdit } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocation, useNavigate } from "react-router-dom";
import { IoReturnDownBackOutline } from "react-icons/io5";

import { getProcesses } from "services/processes";
import { getFlows } from "services/flows";
import { hasPermission } from "utils/permissions";
import { useAuth } from "hooks/useAuth";
import { PrivateLayout } from "layouts/Private";
import { DataTable } from "components/DataTable";
import { labelByProcessStatus } from "utils/constants";
import { getSequencesSortedStagesIds } from "utils/sorting";
import { Pagination } from "components/Pagination";
import { DeletionModal } from "./DeletionModal";
import { CreationModal } from "./CreationModal";
import { EditionModal } from "./EditionModal";

function Processes() {
  const { getUserData } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  const flow = state?.flow;
  const toast = useToast();
  const [selectedProcess, selectProcess] = useState<Process>();
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [legalPriority, setLegalPriority] = useState(false);
  const [showFinished, setShowFinished] = useState<boolean>(true);
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
  const { data: flowsData, isFetched: isFlowsFetched } = useQuery({
    queryKey: ["flows"],
    queryFn: async () => {
      const res = await getFlows(undefined, filter);

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
  const {
    data: processesData,
    isFetched: isProcessesFetched,
    refetch: refetchProcesses,
  } = useQuery({
    queryKey: ["processes"],
    queryFn: async () => {
      const res = await getProcesses(
        flow?.idFlow,
        {
          offset: currentPage * 5,
          limit: 5,
        },
        filter
      );

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
    onError: () => {
      toast({
        id: "processes-error",
        title: "Erro ao carregar processos",
        description:
          "Houve um erro ao carregar processos, favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    },
  });
  const isActionDisabled = (actionName: string) =>
    userData?.value ? !hasPermission(userData.value, actionName) : true;
  const tableActions = useMemo<TableAction[]>(
    () => [
      {
        label: "Visualizar Processo",
        icon: <ViewIcon boxSize={4} />,
        isNavigate: true,
        actionName: "view-process",
        disabled: isActionDisabled("view-process"),
      },
      {
        label: "Editar Processo",
        icon: <Icon as={MdEdit} boxSize={4} />,
        action: ({ process }: { process: Process }) => {
          selectProcess(process);
          onEditionOpen();
        },
        actionName: "edit-process",
        disabled: isActionDisabled("edit-process"),
      },
      {
        label: "Excluir Processo",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: async ({ process }: { process: Process }) => {
          selectProcess(process);
          onDeletionOpen();
        },
        actionName: "delete-process",
        disabled: isActionDisabled("delete-process"),
      },
    ],
    [isProcessesFetched, isUserFetched, userData]
  );
  const filterByPriority = (processes: Process[]) =>
    processes?.filter((process: Process) => process.idPriority);

  const filterByStatus = (processes: Process[]) => {
    if (!showFinished) {
      return processes?.filter(
        (process: Process) =>
          process.status === "finished" || process.status === "archived"
      );
    }
    return processes;
  };
  const filteredProcesses = useMemo<TableRow<Process>[]>(() => {
    if (!isProcessesFetched || !isFlowsFetched) return [];

    let value = processesData?.value;

    if (legalPriority && value) value = filterByPriority(value);
    if (!showFinished && value) value = filterByStatus(value);

    return (
      (value?.reduce(
        (
          acc: TableRow<Process>[] | Process[],
          curr: TableRow<Process> | Process
        ) => {
          const currFlow = flowsData?.value?.find(
            (item) =>
              item?.idFlow === ((curr?.idFlow as number[])[0] || curr?.idFlow)
          ) as Flow;
          const sortedStagesIds = getSequencesSortedStagesIds(
            currFlow?.sequences
          );
          const currIndexInFlow = sortedStagesIds?.indexOf(curr?.idStage) || -1;
          const currentState =
            (currFlow?.stages && currIndexInFlow !== -1) ||
            curr.status === "notStarted"
              ? `${currIndexInFlow + 1}/${sortedStagesIds?.length}`
              : `${currIndexInFlow + 2}/${sortedStagesIds?.length}`;

          return [
            ...acc,
            {
              ...curr,
              tableActions,
              actionsProps: {
                process: curr,
                pathname: `/processos/${curr.record}`,
                state: {
                  process: curr,
                  ...(state || {}),
                },
              },
              // @ts-ignore
              record: curr.idPriority ? (
                <Flex flex="1" alignItems="center" gap="1">
                  {curr.record}
                  <Tooltip
                    label="Prioridade legal"
                    hasArrow
                    background="blackAlpha.900"
                    placement="right"
                  >
                    <ArrowUpIcon boxSize={3.5} />
                  </Tooltip>
                </Flex>
              ) : (
                curr.record
              ),
              currentState: `${
                curr.status === "finished"
                  ? `${currFlow?.stages?.length}/${currFlow?.stages?.length}`
                  : currentState
              }`,
              flowName: currFlow?.name,
              // @ts-ignore
              status: labelByProcessStatus[curr.status],
            },
          ];
        },
        []
      ) as TableRow<Process>[]) || []
    );
  }, [
    legalPriority,
    showFinished,
    processesData,
    filter,
    isProcessesFetched,
    isUserFetched,
    userData,
    tableActions,
    isFlowsFetched,
    isProcessesFetched,
  ]);

  const tableColumnHelper = createColumnHelper<TableRow<any>>();
  const tableColumns = [
    tableColumnHelper.accessor("record", {
      cell: (info) => info.getValue(),
      header: "Registro",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("nickname", {
      cell: (info) => info.getValue(),
      header: "Apelido",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("currentState", {
      cell: (info) => info.getValue(),
      header: "Situação atual",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("flowName", {
      cell: (info) => info.getValue(),
      header: "Fluxo",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("status", {
      cell: (info) => info.getValue(),
      header: "Status",
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
    refetchProcesses();
  }, [flowsData, isFlowsFetched, currentPage]);

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Processos{flow ? ` - Fluxo ${flow?.name}` : ""}
          </Text>
          <Flex
            alignItems="center"
            justifyContent="start"
            gap="2"
            flexWrap="wrap"
          >
            {flow ? (
              <Button
                size="xs"
                fontSize="sm"
                colorScheme="blue"
                onClick={() => navigate("/fluxos", { replace: true })}
              >
                <Icon as={IoReturnDownBackOutline} mr="2" boxSize={3} /> Voltar
                aos Fluxos
              </Button>
            ) : null}
            <Button
              size="xs"
              fontSize="sm"
              colorScheme="green"
              isDisabled={isActionDisabled("create-process")}
              onClick={onCreationOpen}
            >
              <AddIcon mr="2" boxSize={3} /> Criar Processo
            </Button>
          </Flex>
        </Flex>
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Flex justifyContent="flex-start" w="100%">
            <chakra.form
              onSubmit={(e) => {
                e.preventDefault();
                refetchProcesses();
              }}
              w="100%"
              display="flex"
              flexDirection="row"
            >
              <Input
                placeholder="Pesquisar processos (por registro ou apelido)"
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
          <Flex flexDir="row" rowGap="1" columnGap="3" flexWrap="wrap">
            <Checkbox
              colorScheme="green"
              borderColor="gray.600"
              checked={legalPriority}
              onChange={() => setLegalPriority(!legalPriority)}
            >
              Mostrar apenas processos com prioridade legal
            </Checkbox>
            <Checkbox
              colorScheme="green"
              borderColor="gray.600"
              checked={showFinished}
              onChange={() => setShowFinished(!showFinished)}
            >
              Mostrar apenas processos arquivados/finalizados
            </Checkbox>
          </Flex>
        </Flex>
      </Flex>
      <DataTable
        data={filteredProcesses}
        columns={tableColumns}
        isDataFetching={!isProcessesFetched || !isUserFetched}
        emptyTableMessage={`Não foram encontrados processos${
          flow ? ` no fluxo ${flow.name}` : ""
        }.`}
      />
      {processesData?.totalPages !== undefined ? (
        <Pagination
          pageCount={processesData?.totalPages}
          onPageChange={handlePageChange}
        />
      ) : null}
      <CreationModal
        isOpen={isCreationOpen}
        onClose={onCreationClose}
        afterSubmission={refetchProcesses}
      />
      {selectedProcess && (
        <EditionModal
          selectedProcess={selectedProcess}
          isOpen={isEditionOpen}
          onClose={onEditionClose}
          afterSubmission={refetchProcesses}
        />
      )}
      {selectedProcess && (
        <DeletionModal
          process={selectedProcess}
          isOpen={isDeletionOpen}
          onClose={onDeletionClose}
          refetchStages={refetchProcesses}
        />
      )}
    </PrivateLayout>
  );
}

export default Processes;
