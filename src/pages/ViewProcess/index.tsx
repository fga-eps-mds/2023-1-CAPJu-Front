import { Flex, Text, Button, useDisclosure, useToast } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { FiArchive, FiSkipBack, FiSkipForward } from "react-icons/fi";
import { useEffect, useMemo } from "react";
import { useQuery } from "react-query";

import { PrivateLayout } from "layouts/Private";
import { getFlowById } from "services/flows";
import { Flow } from "components/Flow";
import { getStages } from "services/stages";
import { hasPermission } from "utils/permissions";
import { useAuth } from "hooks/useAuth";
import { useLoading } from "hooks/useLoading";
import {
  updateStage,
  getProcessByRecord,
  updateProcess,
} from "services/processes";
import { getPriorities } from "services/priorities";
import { labelByProcessStatus } from "utils/constants";
import { FinalizationModal } from "./FinalizationModal";
import { ArchivationModal } from "./ArchivationModal";

function ViewProcess() {
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
    queryFn: getStages,
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
    return (
      stagesData?.value?.reduce<Stage[]>((acc: Stage[], curr: Stage) => {
        if (!flowData?.value?.stages?.some((item) => item === curr.idStage))
          return acc;

        return [...acc, curr];
      }, []) || []
    );
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
  const isActionDisabled = (actionName: string) =>
    userData?.value ? !hasPermission(userData.value, actionName) : true;
  const isLastStage = useMemo(() => {
    return (
      flowData?.value?.stages[flowData?.value?.stages?.length - 1] ===
      processData?.value?.idStage
    );
  }, [flowData?.value?.stages, processData?.value?.idStage]);

  async function handleUpdateProcessStage(isNextStage: boolean) {
    handleLoading(true);

    const res = processData?.value
      ? await updateStage({
          record: processData?.value?.record as string,
          from: processData?.value?.idStage,
          to: isNextStage ? nextStageId : previousStageId,
          commentary: "",
          idFlow: flowData?.value?.idFlow as number,
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
      ...processData?.value,
      record: processData?.value?.record as string,
      priority: processData?.value?.idPriority,
      idFlow: flowData?.value?.idFlow as number,
      status,
    };

    const res = await updateProcess(body);

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
    console.log(flowData?.value?.sequences[0]?.from);
  }, [flowData]);

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3">
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
              disabled={isActionDisabled("advance-stage")}
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
              {!isLastStage ? (
                <>
                  {!(
                    flowData?.value?.sequences[0]?.from ===
                      processData?.value?.idStage ||
                    !processData?.value?.idStage ||
                    processData?.value?.status !== "inProgress"
                  ) ? (
                    <Button
                      size="xs"
                      fontSize="sm"
                      colorScheme="red"
                      onClick={() => handleUpdateProcessStage(false)}
                      disabled={isActionDisabled("advance-stage")}
                      my="1"
                    >
                      <Icon as={FiSkipBack} mr="2" boxSize={4} />
                      Retroceder Etapa
                    </Button>
                  ) : null}
                  {processData?.value?.status !== "finished" ? (
                    <Button
                      size="xs"
                      fontSize="sm"
                      colorScheme="blue"
                      onClick={onArchivationOpen}
                      disabled={isActionDisabled("advance-stage")}
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
                      disabled={isActionDisabled("advance-stage")}
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
                  disabled={isActionDisabled("advance-stage")}
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
          isFetching={!isProcessFetched || !isFlowFetched}
        />
      </Flex>
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
