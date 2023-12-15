import { Button, Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { FiArchive, FiSkipBack, FiSkipForward } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useStatisticsFilters } from "hooks/useStatisticsFilters";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

import { PrivateLayout } from "layouts/Private";
import { getFlowById } from "services/processManagement/flows";
import { Flow } from "components/Flow";
import { getStages } from "services/processManagement/stage";
import { useAuth } from "hooks/useAuth";
import { useLoading } from "hooks/useLoading";
import {
  archiveProcess,
  finalizeProcess,
  getProcessById,
  updateProcessStatus,
  updateStage,
} from "services/processManagement/processes";
import { getNotesByProcessId } from "services/note";
import { getPriorities } from "services/processManagement/priority";
import { isActionAllowedToUser } from "utils/permissions";
import { sortFlowStages } from "utils/sorting";
import { labelByProcessStatus } from "utils/constants";
import { createColumnHelper } from "@tanstack/react-table";
import { Pagination } from "components/Pagination";
import { FinalizationModal } from "./FinalizationModal";
import { ArchivationModal } from "./ArchivationModal";
import { ReturnModal } from "./ReturnModal";
import { DataTable } from "../../components/DataTable";
import {
  downloadEventsPdf,
  downloadEventsXlsx,
  findAllPaged,
} from "../../services/processManagement/processAud";
import { formatDateTimeToBrazilian } from "../../utils/dates";

function ViewProcess() {
  const { setContinuePage } = useStatisticsFilters();
  const [action, setAction] = useState<Boolean | undefined>();
  const [processRaw, setProcessRaw] = useState<Process>();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { handleLoading } = useLoading();
  const { process, flow }: { process: Process; flow: Flow | undefined } =
    location.state;
  const { getUserData } = useAuth();
  const {
    data: processData,
    isFetched: isProcessFetched,
    refetch: refetchProcess,
    isRefetching: isRefetchingProcess,
  } = useQuery({
    queryKey: ["process", params.idProcess],
    queryFn: async () => {
      const p = await getProcessById(
        params.idProcess || (process.idProcess as number)
      );
      setProcessRaw(p.value);
      return p;
    },
    refetchOnWindowFocus: false,
  });
  const {
    isOpen: isReturnOpen,
    onOpen: onReturnOpen,
    onClose: onReturnClose,
  } = useDisclosure();
  const {
    isOpen: isFinalizationOpen,
    onOpen: onFinalizationOpen,
    onClose: onFinalizationClose,
  } = useDisclosure();
  const {
    isOpen: isArchivationOpen,
    onOpen: onArchivationOpen,
    onClose: onArchivationClose,
  } = useDisclosure();
  const { data: stagesData } = useQuery({
    queryKey: ["stages"],
    queryFn: async () => {
      const res = await getStages();

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
    refetchOnWindowFocus: false,
  });
  const {
    data: notesData,
    refetch: refetchNotes,
    isFetched: isNotesFetched,
  } = useQuery({
    queryKey: ["notes", processData?.value?.idProcess],
    // eslint-disable-next-line consistent-return
    queryFn: async () => {
      if (processData?.value?.idProcess) {
        const res = await getNotesByProcessId(
          processData?.value?.idProcess as number
        );

        if (res.type === "error") throw new Error(res.error.message);

        return res;
      }
    },
    refetchOnWindowFocus: false,
  });
  const { data: userData } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
    refetchOnWindowFocus: false,
  });

  function verifyIdFlow() {
    if (typeof process?.idFlow === "number") return process?.idFlow;
    if (Array.isArray(process?.idFlow)) return process.idFlow[0];

    return process.idFlow;
  }

  const {
    data: flowData,
    isFetched: isFlowFetched,
    refetch: refetchFlow,
  } = useQuery({
    queryKey: ["flow", verifyIdFlow()],
    queryFn: async () => {
      const res = process.idFlow
        ? await getFlowById(
            typeof process?.idFlow === "number"
              ? process?.idFlow
              : process.idFlow[0]
          )
        : { type: "error", value: {} as Flow };

      return res;
    },
    refetchOnWindowFocus: false,
  });
  const { data: priorityData, isFetched: isPriorityFetched } = useQuery({
    queryKey: ["priority", process?.idPriority],
    queryFn: () => getPriorities(process?.idPriority),
    refetchOnWindowFocus: false,
  });
  const stages = useMemo<Stage[]>(() => {
    if (!flowData?.value?.sequences) return [];

    const stagesInFlow =
      stagesData?.value?.reduce<Stage[]>((acc: Stage[], curr: Stage) => {
        if (!flowData?.value?.stages?.some((item) => item === curr.idStage))
          return acc;

        return [...acc, curr];
      }, []) || [];

    return sortFlowStages(stagesInFlow, flowData?.value?.sequences);
  }, [flowData]);
  const previousStageId = useMemo<number>(() => {
    return (
      flowData?.value?.sequences?.find(
        (item) => item.to === processData?.value?.idStage
      )?.from || -1
    );
  }, [flowData, processData]);
  const nextStageId = useMemo<number>(() => {
    return (
      flowData?.value?.sequences?.find(
        (item) => item.from === processData?.value?.idStage
      )?.to || -1
    );
  }, [flowData, processData]);
  const isLastStage = useMemo(() => {
    return stages[stages?.length - 1]?.idStage === processData?.value?.idStage;
  }, [stages, processData?.value?.idStage]);

  async function handleUpdateProcessStage(isNextStage: boolean) {
    handleLoading(true);
    setAction(isNextStage);

    const res = processData?.value
      ? await updateStage({
          idProcess: processData?.value?.idProcess as number,
          record: processData?.value?.record as string,
          from: processData?.value?.idStage,
          to: isNextStage ? nextStageId : previousStageId,
          commentary: "",
          idFlow: flowData?.value?.idFlow as number,
          isNextStage,
        })
      : ({
          type: "error",
          error: new Error(
            "Houve um problema com as informações sobre o processo"
          ),
          value: undefined,
        } as ResultError);

    if (res.type === "success") {
      toast({
        id: "update-stage-success",
        title: "Sucesso!",
        description: `Seu processo ${
          isNextStage ? "avaçou" : "retrocedeu"
        } de etapa.`,
        status: "success",
      });
    } else {
      toast({
        id: "update-stage-error",
        title: `Erro ao  ${isNextStage ? "avaçar" : "retroceder"} etapa`,
        description: res.error?.message,
        status: "error",
        isClosable: true,
      });
    }

    handleLoading(false);
    refetchProcess();
    refetchEvents();
    refetchFlow();
  }
  async function handleUpdateProcessStatus(status: string) {
    handleLoading(true);

    if (!processData?.value) {
      toast({
        id: "start-process-error",
        title: "Erro ao atualizar status do processo no fluxo",
        description: "Há um erro com as informações do processo",
        status: "error",
        isClosable: true,
      });

      handleLoading(false);
      refetchProcess();
      refetchEvents();
      refetchFlow();
      return;
    }

    const body = {
      idProcess: processData?.value?.idProcess as number,
      priority: processData?.value?.idPriority,
      idFlow: flowData?.value?.idFlow as number,
      status,
    };

    const res = await updateProcessStatus(body);

    if (res.type === "success") {
      toast({
        id: "start-process-sucess",
        title: "Sucesso!",
        description: `O status do processo foi atualizado no fluxo com sucesso.`,
        status: "success",
      });
    } else {
      toast({
        id: "start-process-error",
        title: "Erro ao atualizar status do processo no fluxo",
        description: res.error?.message,
        status: "error",
        isClosable: true,
      });
    }

    handleLoading(false);
    refetchProcess();
    refetchEvents();
    refetchFlow();
  }

  useEffect(() => {
    refetchProcess();
    refetchEvents();
    setContinuePage(true);
    if (!process) navigate(-1);
  }, [process]);

  useEffect(() => {
    refetchNotes();
  }, [process, processData]);

  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<TableRow<ProcessEvent>[]>([]);
  const [eventsTablePaginationInfo, setEventsTablePaginationInfo] = useState<{
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  }>();
  const refetchEvents = async (selectedPage?: { selected: number }) => {
    const offset = selectedPage ? selectedPage.selected * 10 : 0;
    setIsLoadingEvents(true);
    const result = await findAllPaged(process.idProcess as number, {
      offset,
      limit: 10,
    });
    const value = result.value as any;
    if (result && result.type === "success") {
      const { data, pagination } = value;
      setEventsTablePaginationInfo(pagination);
      const mappedData = data.map((item: any) => ({
        messages: item.messages
          .slice()
          .reverse()
          .map((message: string, index: number) => (
            // eslint-disable-next-line react/no-array-index-key
            <p key={index} style={{ margin: "10px 0" }}>
              {message}
            </p>
          )),
        changedBy: item.changedBy,
        changedAt: formatDateTimeToBrazilian(item.changedAt as any),
        actions: "-",
      }));
      setTableRows(mappedData);
      setIsLoadingEvents(false);
    } else console.log("Erro ao recuperar eventos");
  };
  useEffect(() => {
    if (!process.record) return;
    refetchEvents().then();
  }, [process, onFinalizationClose]);
  const tableColumnHelper = createColumnHelper<TableRow<any>>();
  const tableProcessEventsColumns = [
    tableColumnHelper.accessor("messages", {
      cell: (info) => info.getValue(),
      header: "Evento",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("changedBy", {
      cell: (info) => info.getValue(),
      header: "Autor",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("changedAt", {
      cell: (info) => info.getValue(),
      header: "Data",
      meta: {
        isSortable: true,
      },
    }),
  ];

  return (
    <PrivateLayout>
      <Flex w="50%" flexDir="column" gap="3" mb="5">
        <Flex
          w="100%"
          justifyContent="space-between"
          alignItems="end"
          gap="2"
          flexWrap="wrap"
        >
          <Text
            fontSize="25px"
            fontWeight="semibold"
            display="flex"
            alignItems="center"
            gap="1"
          >
            Andamento
            <Text as="span" fontSize="25px" fontWeight="300">
              ({processData?.value?.record})
            </Text>
          </Text>
          <Button colorScheme="blue" onClick={() => navigate(-1)}>
            <Icon as={IoReturnDownBackOutline} mr="2" boxSize={3} /> Voltar{" "}
            {flow ? ` do Fluxo ${flow?.name}` : ""}
          </Button>
        </Flex>
        <Flex
          w="100%"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
          gap="1"
          flexWrap="wrap"
        >
          <Text fontWeight="semibold" fontSize="20px">
            Status:{" "}
            <Text as="span" fontWeight="300" fontSize="15px">
              {/* @ts-ignore */}
              {labelByProcessStatus[processData?.value?.status]}
            </Text>
          </Text>
          <Text fontWeight="semibold" fontSize="20px">
            Fluxo:{" "}
            <Text as="span" fontWeight="300" fontSize="15px">
              {flowData?.value?.name}
            </Text>
          </Text>
          {isPriorityFetched ? (
            <Text fontWeight="semibold" fontSize="20px">
              Prioridade Legal:{" "}
              <Text as="span" fontWeight="300" fontSize="15px">
                {(priorityData?.value as Priority)?.description || "Não tem"}
              </Text>
            </Text>
          ) : null}
          {processData?.value?.status === "notStarted" ? (
            <Button
              colorScheme="green"
              onClick={() => handleUpdateProcessStatus("inProgress")}
              isDisabled={
                !isActionAllowedToUser(
                  userData?.value?.allowedActions || [],
                  "forward-stage"
                )
              }
              my="1"
            >
              <Icon as={FiSkipForward} mr="2" boxSize={4} />
              Iniciar Processo
            </Button>
          ) : (
            <Flex
              w="100%"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap="1"
              flexWrap="wrap"
            >
              {processData?.value?.status === "inProgress" &&
              !!processData?.value?.idStage &&
              processData?.value?.idStage !== stages[0]?.idStage ? (
                <Button
                  colorScheme="red"
                  onClick={onReturnOpen}
                  isDisabled={
                    !isActionAllowedToUser(
                      userData?.value?.allowedActions || [],
                      "backward-stage"
                    )
                  }
                  my="1"
                >
                  <Icon as={FiSkipBack} mr="2" boxSize={4} />
                  Retroceder Etapa
                </Button>
              ) : null}
              {!isLastStage ? (
                <>
                  {processData?.value?.status !== "finished" ? (
                    <Button
                      fontSize="sm"
                      colorScheme={
                        processData?.value?.status === "archived"
                          ? "blue"
                          : "red"
                      }
                      onClick={onArchivationOpen}
                      isDisabled={
                        !isActionAllowedToUser(
                          userData?.value?.allowedActions || [],
                          "archive-process"
                        )
                      }
                      my="1"
                      ml="auto"
                    >
                      {processData?.value?.status === "archived"
                        ? "Reativar "
                        : "Interromper "}
                      Processo
                      <Icon as={FiArchive} ml="2" boxSize={4} />
                    </Button>
                  ) : null}
                  {processData?.value?.status === "inProgress" ? (
                    <Button
                      colorScheme="green"
                      onClick={() => handleUpdateProcessStage(true)}
                      isDisabled={
                        !isActionAllowedToUser(
                          userData?.value?.allowedActions || [],
                          "forward-stage"
                        )
                      }
                      my="1"
                    >
                      Avançar Etapa
                      <Icon as={FiSkipForward} ml="2" boxSize={4} />
                    </Button>
                  ) : null}
                </>
              ) : null}
              {isLastStage && processData?.value?.status !== "finished" ? (
                <Button
                  fontSize="sm"
                  colorScheme="blue"
                  onClick={onFinalizationOpen}
                  isDisabled={
                    !isActionAllowedToUser(
                      userData?.value?.allowedActions || [],
                      "end-process"
                    )
                  }
                  my="1"
                  ml="auto"
                >
                  <Icon as={FiSkipForward} mr="2" boxSize={4} />
                  Concluir Processo
                </Button>
              ) : null}
            </Flex>
          )}
        </Flex>
        {!isRefetchingProcess && (
          <Flow
            sequences={flowData?.value?.sequences || []}
            stages={stages || []}
            minHeight={650}
            currentStage={
              processData?.value?.status !== "finished"
                ? processData?.value?.idStage
                : undefined
            }
            effectiveDate={processData?.value?.effectiveDate}
            isFetching={!isProcessFetched || !isFlowFetched || !isNotesFetched}
            process={processData?.value}
            isNextStage={action}
            refetch={() => {
              refetchFlow();
              refetchProcess();
              refetchEvents();
              refetchNotes();
            }}
            allowComments={processData?.value?.status === "inProgress"}
            notes={notesData?.value}
          />
        )}
      </Flex>
      {processData?.value && (
        <ReturnModal
          process={processData?.value}
          isOpen={isReturnOpen}
          onClose={onReturnClose}
          handleReturnProcess={() => {
            handleUpdateProcessStage(false);
            onReturnClose();
          }}
        />
      )}
      {processData?.value && (
        <FinalizationModal
          process={processData?.value}
          isOpen={isFinalizationOpen}
          onClose={onFinalizationClose}
          handleFinishProcess={() => {
            finalizeProcess(processData.value).then(() => {
              refetchProcess();
              refetchEvents();
            });
          }}
        />
      )}
      {processData?.value && (
        <ArchivationModal
          process={processData?.value}
          isOpen={isArchivationOpen}
          onClose={onArchivationClose}
          handleUpdateProcessStatus={() => {
            archiveProcess(processData?.value).then(() => {
              refetchProcess();
              refetchEvents();
            });
            onArchivationClose();
          }}
        />
      )}
      <Flex w="50%" flexDir="column" gap="3" mb="5">
        <Flex
          w="100%"
          justifyContent="space-between"
          alignItems="center"
          gap="2"
          flexWrap="wrap"
        >
          <Text
            fontSize="30px"
            fontWeight="semibold"
            display="flex"
            alignItems="center"
            gap="1"
          >
            Eventos
          </Text>
          <Flex flexDir="row" alignItems="center" gap="2">
            <Button
              title="Baixar excel"
              colorScheme="green"
              onClick={(event) => {
                event.preventDefault();
                downloadEventsXlsx(
                  processRaw?.record as string,
                  process.idProcess
                ).finally();
              }}
            >
              <Icon as={FaFileExcel} boxSize={4} />
            </Button>
            <Button
              title="Baixar pdf"
              colorScheme="green"
              onClick={(event) => {
                event.preventDefault();
                downloadEventsPdf({
                  idProcess: process.idProcess,
                  record: processRaw?.record,
                }).catch((r) =>
                  toast({
                    description: r.message,
                    status: "error",
                    isClosable: true,
                  })
                );
              }}
            >
              <Icon as={FaFilePdf} boxSize={4} />
            </Button>
          </Flex>
        </Flex>
        <Flex
          w="100%"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
          gap="1"
          flexWrap="wrap"
          position="relative"
        >
          <DataTable
            maxWidth="unset"
            width="100%"
            size="md"
            data={tableRows}
            columns={tableProcessEventsColumns}
            isDataFetching={isLoadingEvents}
            emptyTableMessage="Não foram encontrados eventos para o processo"
          />
          <Pagination
            pageCount={eventsTablePaginationInfo?.totalPages as number}
            onPageChange={refetchEvents}
          />
        </Flex>
      </Flex>
    </PrivateLayout>
  );
}

export default ViewProcess;
