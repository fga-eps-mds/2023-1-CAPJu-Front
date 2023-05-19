import { Flex, Text, Button } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { useEffect, useMemo } from "react";
import { useQuery } from "react-query";

import { PrivateLayout } from "layouts/Private";
import { getFlowById } from "services/flows";
import { Flow } from "components/Flow";
import { getStages } from "services/stages";

function ProcessDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { process } = location.state;
  const { data: stagesData } = useQuery({
    queryKey: ["stages"],
    queryFn: getStages,
  });
  const { data: flowData } = useQuery({
    queryKey: `flow-${process.idFlow[0]}`,
    queryFn: async () => {
      if (!process.idFlow[0]) {
        return { type: "error", value: undefined };
      }

      const res = await getFlowById(process.idFlow[0]);

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

  useEffect(() => {
    if (!process) navigate(-1);
  }, []);

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="8" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text
            fontSize="lg"
            fontWeight="semibold"
            display="flex"
            alignItems="center"
            gap="1"
          >
            Processo {process?.nickname}
            <Text as="span" fontSize="md" fontWeight="300">
              ({process?.record})
            </Text>
          </Text>
          <Button
            size="xs"
            fontSize="sm"
            colorScheme="blue"
            onClick={() => navigate(-1)}
          >
            <Icon as={IoReturnDownBackOutline} mr="2" boxSize={3} /> Voltar aos
            Processos
          </Button>
        </Flex>
        <Flow
          sequences={flowData?.value?.sequences || []}
          stages={stages || []}
          minHeight={650}
          currentStage={process?.idStage}
          effectiveDate={process?.effectiveDate}
        />
      </Flex>
    </PrivateLayout>
  );
}

export default ProcessDetail;
