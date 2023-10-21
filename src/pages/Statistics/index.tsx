import { Box, Flex, Text, Button, useToast, Select } from "@chakra-ui/react";
import { PrivateLayout } from "layouts/Private";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { getFlows } from "services/processManagement/flows";
import CustomAccordion from "../../components/CustomAccordion";

export default function Statistics() {
  const toast = useToast();

  useEffect(() => {
    return () => {
      setOpenSelectStage(false);
    };
  }, []);

  const { data: flowsData, isFetched: isFlowsFetched } = useQuery({
    queryKey: ["flows"],
    queryFn: async () => {
      const res = await getFlows();

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

  const [openSelectStage, setOpenSelectStage] = useState(isFlowsFetched);

  const [selectedFlow, setSelectedFlow] = useState(-1);

  const handleConfirmSelection = async () => {
    if (selectedFlow) {
      setOpenSelectStage(true);
    } else {
      toast({
        id: "error-no-selection",
        title: "Erro!",
        description: "Selecione um fluxo antes de confirmar.",
        status: "error",
        isClosable: true,
      });

      setOpenSelectStage(false);
    }
  };

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text
            fontSize="22px"
            fontWeight="600"
            fontStyle="normal"
            lineHeight="24px"
          >
            Estatísticas
          </Text>
        </Flex>
        <Box borderRadius="8px">
          <Flex justifyContent="flex-start" w="100%" flexDirection="column">
            <CustomAccordion
              title="Visualizar quantidade de processos em cada etapa"
              marginBottom={18}
            >
              {openSelectStage ? (
                <>
                  <Flex>
                    <Select
                      placeholder="Selecione a etapa"
                      marginLeft="36px"
                      width="302px"
                    >
                      <option>dfsfsf</option>
                    </Select>
                    <Button
                      colorScheme="green"
                      marginLeft="20px"
                      onClick={() => setOpenSelectStage(true)}
                    >
                      Confirmar
                    </Button>
                  </Flex>
                </>
              ) : (
                <Flex>
                  <Select
                    placeholder="Selecione o fluxo"
                    marginLeft="36px"
                    width="302px"
                    onChange={(e) => setSelectedFlow(Number(e.target.value))}
                  >
                    {flowsData?.value?.map((flow: any) => (
                      <option value={flow.idFlow} key={flow.name}>
                        {flow.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    colorScheme="green"
                    marginLeft="20px"
                    onClick={() => {
                      setOpenSelectStage(true);
                      handleConfirmSelection();
                    }}
                  >
                    Confirmar
                  </Button>
                </Flex>
              )}
            </CustomAccordion>
          </Flex>
        </Box>
      </Flex>
    </PrivateLayout>
  );
}
