import { Flex, Text, Button, useToast } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { FiSkipForward } from "react-icons/fi";
import { useEffect, useMemo } from "react";
import { useQuery } from "react-query";

import { PrivateLayout } from "layouts/Private";
import { getFlowById } from "services/flows";
import { Flow } from "components/Flow";
import { getStages } from "services/stages";
import { hasPermission } from "utils/permissions";
import { useAuth } from "hooks/useAuth";
import { useLoading } from "hooks/useLoading";
import { advanceStage, getProcessByRecord } from "services/processes";
import { getPriorities } from "services/priorities";

function ViewProcess() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { handleLoading } = useLoading();
  const { process, flow }: { process: Process; flow: Flow | undefined } =
    location.state;
  const { getUserData } = useAuth();
  const { data: processData, refetch: refetchProcess } = useQuery({
    queryKey: ["process", params.record],
    queryFn: async () => {
      const res = await getProcessByRecord(
        params.record || (process.record as string)
      );
      return res;
    },
  });
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
    isFetching: isFlowFetching,
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
  const nextStageId = useMemo<number>(() => {
    return (
      flowData?.value?.sequences?.find(
        (item) => item.from === processData?.value?.idStage
      )?.to || -1
    );
  }, [flowData, processData]);
  const isActionDisabled = (actionName: string) =>
    userData?.value ? !hasPermission(userData.value, actionName) : true;

  async function handleNextStage() {
    handleLoading(true);

    const res = processData?.value
      ? await advanceStage({
          record: processData?.value?.record as string,
          from: processData?.value?.idStage,
          to: nextStageId,
          commentary: "",
          idFlow:
            typeof process.idFlow === "number"
              ? process.idFlow
              : process.idFlow[0],
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
        id: "advance-stage-success",
        title: "Sucesso!",
        description: `Seu processo avançou para a próxima etapa.`,
        status: "success",
      });
    } else {
      toast({
        id: "advance-stage-error",
        title: "Erro ao avançar etapa",
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
    if (!process) navigate(-1);
  }, []);

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
            Processo - {process.nickname}
            <Text as="span" fontSize="md" fontWeight="300">
              ({process.record})
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
          <Flex
            w="100%"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            gap="1"
            flexWrap="wrap"
          >
            <Button
              size="sm"
              colorScheme="green"
              onClick={() => handleNextStage()}
              disabled={isActionDisabled("advance-stage")}
              my="1"
            >
              Avançar de Etapa
              <Icon as={FiSkipForward} ml="2" boxSize={4} />
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => handleNextStage()}
              // disabled={isActionDisabled("advance-stage")}
              my="1"
            >
              Finalizar processo
              <Icon as={FiSkipForward} ml="2" boxSize={4} />
            </Button>
          </Flex>
        </Flex>
        <Flow
          sequences={flowData?.value?.sequences || []}
          stages={stages || []}
          minHeight={650}
          currentStage={processData?.value?.idStage}
          effectiveDate={processData?.value?.effectiveDate}
          isFetching={isFlowFetching}
        />
      </Flex>
    </PrivateLayout>
  );
}

export default ViewProcess;
