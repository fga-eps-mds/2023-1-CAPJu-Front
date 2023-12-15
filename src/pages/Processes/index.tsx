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
  Select,
  Image,
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

import { getProcesses } from "services/processManagement/processes";
import { isActionAllowedToUser } from "utils/permissions";
import { useAuth } from "hooks/useAuth";
import { PrivateLayout } from "layouts/Private";
import { DataTable } from "components/DataTable";
import { labelByProcessStatus } from "utils/constants";
import { getSequencesSortedStagesIds } from "utils/sorting";
import { Pagination } from "components/Pagination";
import { DeletionModal } from "./DeletionModal";
import { CreationModal } from "./CreationModal";
import { EditionModal } from "./EditionModal";
import { VisualizationFilesModal } from "./ProcessesFile/VisualizationFilesModal";
import line52 from "../../images/Line_52.svg";

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
  const [filter, setFilter] = useState<{ type: string; value: string }>({
    type: "process",
    value: "",
  });
  const [legalPriority, setLegalPriority] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
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
  const {
    isOpen: isProcessesFileModalOpen,
    onOpen: onProcessesFileModalOpen,
    onClose: onProcessesFileModalClose,
  } = useDisclosure();
  const [currentPage, setCurrentPage] = useState(0);
  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };
  const [selectedFilter, setSelectedFilter] = useState("process");
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
          offset: currentPage * 10,
          limit: 10,
        },
        filter,
        legalPriority,
        showFinished ? ["archived", "finished"] : ["inProgress", "notStarted"]
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
  const tableActions = useMemo<TableAction[]>(
    () => [
      {
        label: "Visualizar Processo",
        icon: <ViewIcon boxSize={4} />,
        isNavigate: true,
        actionName: "see-process",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "see-process"
        ),
      },
      {
        label: "Editar Processo",
        icon: <Icon as={MdEdit} boxSize={4} />,
        action: ({ process }: { process: Process }) => {
          selectProcess(process);
          onEditionOpen();
        },
        actionName: "edit-process",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "edit-process"
        ),
      },
      {
        label: "Excluir Processo",
        icon: <Icon as={MdDelete} boxSize={4} />,
        action: async ({ process }: { process: Process }) => {
          selectProcess(process);
          onDeletionOpen();
        },
        actionName: "delete-process",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "delete-process"
        ),
      },
    ],
    [isProcessesFetched, isUserFetched, userData]
  );
  const processesTableRows = useMemo<TableRow<Process>[]>(() => {
    if (!isProcessesFetched) return [];

    return (
      (processesData?.value?.reduce(
        (
          acc: TableRow<Process>[] | Process[],
          curr: TableRow<Process> | Process
        ) => {
          const currFlow = curr?.flow as Flow;

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
                pathname: `/processos/${curr.idProcess}`,
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
    processesData,
    isProcessesFetched,
    userData,
    isUserFetched,
    tableActions,
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
    tableColumnHelper.accessor("stageName", {
      cell: (info) => info.getValue(),
      header: "Etapa Atual",
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
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(0);
    refetchProcesses();
  }, [legalPriority, showFinished]);

  const [placeholder, setPlaceholder] = useState<string>(
    "Pesquisar processos (por registro ou apelido)"
  );

  useEffect(() => {
    switch (selectedFilter) {
      case "process":
        setPlaceholder("Pesquisar processos (por registro ou apelido)");
        setFilter({ type: selectedFilter, value: filter?.value });
        break;
      case "stage":
        setPlaceholder("Pesquisar processos (pelo nome da Etapa)");
        setFilter({ type: selectedFilter, value: filter?.value });
        break;
      case "flow":
        setPlaceholder("Pesquisar processos (pelo nome do Fluxo)");
        setFilter({ type: selectedFilter, value: filter?.value });
        break;
      default:
      // do nothing
    }
  }, [selectedFilter]);

  return (
    <PrivateLayout>
      <Flex w="100%" maxWidth={1120} flexDir="column" gap="3" mb="4" mt="50px">
        <Flex w="50%" mb="2" justifyContent="start">
          <Text fontSize="25px" fontWeight="semibold">
            Processos{flow ? ` - Fluxo ${flow?.name}` : ""}
          </Text>
        </Flex>
        <Flex>
          {flow ? (
            <Button
              size="md"
              fontSize="md"
              colorScheme="blue"
              onClick={() => navigate("/fluxos", { replace: true })}
            >
              <Icon as={IoReturnDownBackOutline} mr="2" boxSize={3} /> Voltar
              aos Fluxos
            </Button>
          ) : null}
        </Flex>
        <Flex justifyContent="space-between" gap="2" mb="15px">
          <Flex
            alignItems="center"
            justifyContent="start"
            gap="2"
            flexWrap="wrap"
          >
            <Button
              size="md"
              fontSize="md"
              colorScheme="green"
              isDisabled={
                !isActionAllowedToUser(
                  userData?.value?.allowedActions || [],
                  "create-process"
                )
              }
              onClick={onCreationOpen}
            >
              <AddIcon mr="2" boxSize={3} /> Criar Processo
            </Button>
            <Button
              size="md"
              fontSize="md"
              colorScheme="green"
              onClick={onProcessesFileModalOpen}
            >
              <AddIcon mr="2" boxSize={4} />
              Importar Processos
            </Button>
          </Flex>
          <Flex w="65%">
            <chakra.form
              onSubmit={(e) => {
                e.preventDefault();
                refetchProcesses();
              }}
              w="100%"
              display="flex"
              flexDirection="row"
              color="gray.500"
            >
              <Flex
                borderRadius="8px"
                w="100%"
                gap="2"
                alignItems="center"
                backgroundColor="white"
              >
                <Input
                  placeholder={placeholder}
                  value={filter?.value}
                  onChange={({ target }) =>
                    setFilter({ type: selectedFilter, value: target.value })
                  }
                  variant="filled"
                  w="100%"
                  css={{
                    "&, &:hover, &:focus": {
                      background: "white",
                    },
                  }}
                  backgroundColor="red"
                  border="30px"
                />
                <Image
                  zIndex="3"
                  src={line52}
                  marginLeft="0%"
                  width="3%"
                  height="27px"
                  border="30px"
                />
                <Select
                  css={{
                    "&, &:hover, &:focus": {
                      background: "white",
                    },
                  }}
                  borderWidth="0"
                  marginRight="0%"
                  w="25%"
                  value={selectedFilter}
                  onChange={({ target }) => setSelectedFilter(target.value)}
                  border="30px"
                  outline="none"
                >
                  <option value="stage">Etapa</option>
                  <option value="flow">Fluxo</option>
                  <option value="process">Processo</option>
                </Select>
              </Flex>
              <Button
                aria-label="botao-busca-processes"
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
        <Flex w="100%" gap="2" flexWrap="wrap" justifyContent="end">
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
              Mostrar processos interrompidos/concluídos
            </Checkbox>
          </Flex>
        </Flex>
      </Flex>
      <DataTable
        data={processesTableRows}
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
        // @ts-ignore
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
      <VisualizationFilesModal
        isOpen={isProcessesFileModalOpen}
        onClose={onProcessesFileModalClose}
      />
    </PrivateLayout>
  );
}

export default Processes;
