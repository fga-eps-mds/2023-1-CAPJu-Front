import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Text,
  Button,
  useToast,
  Select,
} from "@chakra-ui/react";
import { PrivateLayout } from "layouts/Private";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { getFlows } from "services/processManagement/flows";
import { getStagesByIdFlow } from "services/processManagement/statistics";

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
  const [stages, setStages] = useState<Stage[]>([]);

  const handleConfirmSelection = async () => {
    if (selectedFlow) {
      setOpenSelectStage(true);

      const stagesResult = await getStagesByIdFlow(selectedFlow);

      console.log("Etapas :", stagesResult);

      if (stagesResult.type === "success") {
        const storeStages = stagesResult.value;
        setStages(storeStages);
        console.log("Etapas:", stages);
      } else {
        toast({
          id: "error-getting-stages",
          title: "Erro ao buscar etapas",
          description: "Houve um erro ao buscar as etapas.",
          status: "error",
          isClosable: true,
        });
      }
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

  console.log(selectedFlow);

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
        <Box backgroundColor="#FFF" borderRadius="8px">
          <Flex justifyContent="flex-start" w="100%">
            <Accordion defaultIndex={[0]} allowMultiple width="100%">
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <AccordionIcon />
                    <Box
                      as="span"
                      textAlign="left"
                      marginLeft="18"
                      fontSize="17px"
                      fontWeight="600"
                      fontStyle="normal"
                      lineHeight="24px"
                    >
                      Visualizar quantidade de processos em cada etapa
                    </Box>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} width="100%">
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
                        onChange={(e) =>
                          setSelectedFlow(Number(e.target.value))
                        }
                      >
                        {flowsData?.value?.map((flow) => (
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
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Flex>
        </Box>
      </Flex>
    </PrivateLayout>
  );
}
