import {useEffect, useMemo, useState} from "react";
import {useQuery} from "react-query";
import {
  Button,
  chakra,
  Checkbox,
  Flex,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import {AddIcon, ArrowUpIcon, Icon, SearchIcon, ViewIcon,} from "@chakra-ui/icons";
import {MdDelete, MdEdit} from "react-icons/md";
import {createColumnHelper} from "@tanstack/react-table";
import {useLocation, useNavigate} from "react-router-dom";
import {IoReturnDownBackOutline} from "react-icons/io5";

import {getProcesses} from 'services/processManagement/processes';
import {isActionAllowedToUser} from "utils/permissions";
import {useAuth} from 'hooks/useAuth';
import {PrivateLayout} from 'layouts/Private';
import {DataTable} from 'components/DataTable';
import {labelByProcessStatus} from 'utils/constants';
import {Pagination} from 'components/Pagination';
import {FaFileUpload} from "react-icons/fa";
import {DeletionModal} from './DeletionModal';
import {CreationModal} from './CreationModal';
import {EditionModal} from './EditionModal';
import {ImportProcessesModal} from './ImportProcessesModal';
import ProcessesFileComponent from './ProcessesFile';

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
    refetchOnWindowFocus: false,
  });
  const [nicknameOrRecordFilter, setNicknameOrRecordFilter] = useState<string>('');
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
    isOpen: isImportationOpen,
    onOpen: onImportationOpen,
    onClose: onImportationClose,
  } = useDisclosure();

  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  const {
    data: processesData,
    isFetched: isProcessesFetched,
    refetch: refetchProcesses,
  } = useQuery({
    queryKey: ["processes"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const hasFilter = nicknameOrRecordFilter.trim() || legalPriority || showFinished;
      const res = await getProcesses(
        flow?.idFlow,
        {
          offset: hasFilter ? 0 : currentPage * 10,
          limit: 10,
        },
        nicknameOrRecordFilter.trim(),
        legalPriority,
        showFinished
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
        icon: <ViewIcon boxSize={6} />,
        isNavigate: true,
        actionName: "see-process",
        disabled: !isActionAllowedToUser(
          userData?.value?.allowedActions || [],
          "see-process"
        ),
      },
      {
        label: "Editar Processo",
        icon: <Icon as={MdEdit} boxSize={6} />,
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
        icon: <Icon as={MdDelete} boxSize={6} />,
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
                    label={(curr as any)['processPriority.description']}
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
              currentState: curr.progress,
              flowName: (curr as any)['flowInfo.name'],
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
  }, [currentPage, showFinished, legalPriority]);

  const [isProcessesFileTabEnabled, setIsProcessesFileTabEnabled] = useState<boolean>(false);

  return (
    <PrivateLayout>

      <Tabs  w="50%" variant="line" colorScheme="green" size='lg'>
        <TabList mb="4">
          <Tab sx={{ paddingBottom: "0", fontSize: '23px', fontFamily: 'Lingconsolata', color: 'white' }}>Processos</Tab>
          <Tab onClick={() => setIsProcessesFileTabEnabled(true)} sx={{ paddingBottom: "0", fontSize: '23px', fontFamily: 'Lingconsolata', color: 'white' }}>Lotes</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Flex w="50%" flexDir="column" gap="3" mb="4" color="white">
              <Flex flexDirection="column" gap="2">
                <Text fontSize="30px" fontWeight="semibold" color="white">
                  Processos{flow ? ` - Fluxo ${flow?.name}` : ""}
                </Text>
                <Flex width="200%"  justifyContent="space-between" gap="2" flexWrap="wrap" mt="25px">
                  <Flex w="100%" justifyContent="flex-start" alignItems="center" gap="2" flexWrap="wrap">
                    {flow ? (
                        <Button
                            size="md"
                            fontSize="md"
                            colorScheme="blue"
                            onClick={() => navigate("/fluxos", { replace: true })}
                        >
                          <Icon as={IoReturnDownBackOutline} mr="2" boxSize={3} /> Voltar aos Fluxos
                        </Button>
                    ) : null}
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
                      <AddIcon mr="2" boxSize={3} /> Cadastrar processo
                    </Button>
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
                        onClick={onImportationOpen}
                    >
                      <Icon as={FaFileUpload} mr="2" boxSize={4} style={{ marginRight: '8px' }}/> Importar lote
                    </Button>
                    <chakra.form
                        onSubmit={(e) => {
                          e.preventDefault();
                          refetchProcesses();
                        }}
                        width="69%"
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        gap="2"
                        ml="auto"
                    >
                      <Checkbox
                          colorScheme="green"
                          borderColor="gray.600"
                          checked={legalPriority}
                          onChange={() => setLegalPriority(!legalPriority)}
                          flexShrink={0}  // Prevent checkbox from shrinking
                          maxWidth="unset" // Override any max width constraints
                      >
                        Prioridade legal
                      </Checkbox>
                      <Checkbox
                          colorScheme="green"
                          borderColor="gray.600"
                          checked={showFinished}
                          onChange={() => setShowFinished(!showFinished)}
                          flexShrink={0}  // Prevent checkbox from shrinking
                          maxWidth="unset" // Override any max width constraints
                      >
                        Arquivados/finalizados
                      </Checkbox>
                      <Input
                          color="black"
                          placeholder="Pesquisar processos (por registro ou apelido)"
                          value={nicknameOrRecordFilter}
                          onChange={({ target }) => setNicknameOrRecordFilter(target.value)}
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
                          justifyContent="center"
                          type="submit"
                      >
                        <SearchIcon boxSize={4} />
                      </Button>
                    </chakra.form>

                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <DataTable
                maxWidth='unset'
                width='100%'
                size="lg"
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
            <ImportProcessesModal
                isOpen={isImportationOpen}
                onClose={onImportationClose}
                afterSubmission={refetchProcesses} />
          </TabPanel>
          <TabPanel>
            <ProcessesFileComponent
                isProcessesFileTabEnabled={isProcessesFileTabEnabled}
                isUserFetched={isUserFetched}
                userData={userData} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </PrivateLayout>
  );
}

export default Processes;
