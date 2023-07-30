import { Flex, Text, Button, useDisclosure, useToast } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { FiArchive, FiSkipBack, FiSkipForward } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";

import { PrivateLayout } from "layouts/Private";
import { getFlowById } from "services/processManagement/flows";
import { Flow } from "components/Flow";
import { getStages } from "services/processManagement/stage";
import { useAuth } from "hooks/useAuth";
import { useLoading } from "hooks/useLoading";
import {
  updateStage,
  getProcessByRecord,
  updateProcessStatus,
} from "services/processManagement/processes";
import { getNotesByProcessRecord } from "services/note";
import { getPriorities } from "services/processManagement/priority";
import { isActionAllowedToUser } from "utils/permissions";
import { sortFlowStages } from "utils/sorting";
import { labelByProcessStatus } from "utils/constants";
import { FinalizationModal } from "./FinalizationModal";
import { ArchivationModal } from "./ArchivationModal";
import { ReturnModal } from "./ReturnModal";

function ViewProcess() {
  const [action, setAction] = useState<Boolean | undefined>();
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
    queryKey: ["process", params.record],
    queryFn: async () => {
      const res = await getProcessByRecord(
        params.record || (process.record as string)
      );

      return res;
    },
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
  });
  const {
    data: notesData,
    refetch: refetchNotes,
    isFetched: isNotesFetched,
  } = useQuery({
    queryKey: ["notes", processData?.value?.record],
    queryFn: async () => {
      const res = await getNotesByProcessRecord(
        processData?.value?.record as string
      );

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
  });
  const { data: userData } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const {
    data: flowData,
    isFetched: isFlowFetched,
    refetch: refetchFlow,
  } = useQuery({
    queryKey: [
      "flow",
      typeof process?.idFlow === "number"
        ? process?.idFlow
        : process?.idFlow[0],
    ],
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
  });
  const { data: priorityData, isFetched: isPriorityFetched } = useQuery({
    queryKey: ["priority", process?.idPriority],
    queryFn: async () => {
      const res = await getPriorities(process?.idPriority);
      return res;
    },
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
      refetchFlow();
      return;
    }

    const body = {
      record: processData?.value?.record as string,
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
    refetchFlow();
  }

  useEffect(() => {
    refetchProcess();
    if (!process) navigate(-1);
  }, [process]);

  useEffect(() => {
    refetchNotes();
  }, [process, processData]);

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="5">
        <Flex
          w="100%"
          justifyContent="space-between"
          alignItems="end"
          gap="2"
          flexWrap="wrap"
        >
          <Text
            fontSize="lg"
            fontWeight="semibold"
            display="flex"
            alignItems="center"
            gap="1"
          >
            Processo - {processData?.value?.nickname}
            <Text as="span" fontSize="md" fontWeight="300">
              ({processData?.value?.record})
            </Text>
          </Text>
          <Button
            size="xs"
            fontSize="sm"
            colorScheme="blue"
            onClick={() => navigate(-1)}
          >
            <Icon as={IoReturnDownBackOutline} mr="2" boxSize={3} /> Voltar aos
            Processos{flow ? ` do Fluxo ${flow?.name}` : ""}
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
          <Text fontWeight="semibold">
            Status:{" "}
            <Text as="span" fontWeight="300">
              {/* @ts-ignore */}
              {labelByProcessStatus[processData?.value?.status]}
            </Text>
          </Text>
          <Text fontWeight="semibold">
            Fluxo:{" "}
            <Text as="span" fontWeight="300">
              {flowData?.value?.name}
            </Text>
          </Text>
          {isPriorityFetched ? (
            <Text fontWeight="semibold">
              Prioridade Legal:{" "}
              <Text as="span" fontWeight="300">
                {(priorityData?.value as Priority)?.description || "Não tem"}
              </Text>
            </Text>
          ) : null}
          {processData?.value?.status === "notStarted" ? (
            <Button
              size="xs"
              fontSize="sm"
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
                  size="xs"
                  fontSize="sm"
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
                      size="xs"
                      fontSize="sm"
                      colorScheme="blue"
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
                        ? "Desarquivar"
                        : "Arquivar"}{" "}
                      Processo
                      <Icon as={FiArchive} ml="2" boxSize={4} />
                    </Button>
                  ) : null}
                  {processData?.value?.status === "inProgress" ? (
                    <Button
                      size="xs"
                      fontSize="sm"
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
                  size="xs"
                  fontSize="sm"
                  colorScheme="red"
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
                  Finalizar Processo
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
            handleUpdateProcessStatus("finished");
            onFinalizationClose();
          }}
        />
      )}
      {processData?.value && (
        <ArchivationModal
          process={processData?.value}
          isOpen={isArchivationOpen}
          onClose={onArchivationClose}
          handleUpdateProcessStatus={() => {
            handleUpdateProcessStatus(
              processData?.value?.status === "archived"
                ? "inProgress"
                : "archived"
            );
            onArchivationClose();
          }}
        />
      )}
    </PrivateLayout>
  );
}

export default ViewProcess;
