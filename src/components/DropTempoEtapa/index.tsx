import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Flex,
    Image,
    Text,
    Button,
    useToast,
  } from "@chakra-ui/react";
  // import { useState} from "react";
  import { useState, useEffect } from "react";
  import {useQuery} from "react-query";
  import { PrivateLayout } from "../../layouts/Private";
  import { Select } from "../FormFields";
  import { getFlows, getHistoricFlow, getExpectedFlow  } from "../../services/processManagement/flows";
  import ChartTempos from "./ChartTempos";

  export interface Data {
    label: string,
    medio: number,
    previsto: number,
  }

  export default function Statistics() {
    
    const toast = useToast();
    const [idFlow, setIdFlow] = useState<number>();
    const [nameFlow, setNameFlow] = useState<string>("");
    const [chartData, setChartData] = useState<Data[]>();
    const [blankText, setBlankText] = useState<string>("");
    
    useEffect(() => {
    }, [chartData]);

    const mesclaVetores = (labels: Array<string>, medio: Array<number>, previsto:Array<number>) => {
        const resultado = labels.map((label, index) => {
          const obj: Data = { label, medio: medio[index], previsto: previsto[index] }
          return obj;
        });

        return resultado;
    };

    const { data: flowsData } = useQuery({
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
      refetchOnWindowFocus: false,
    });

    const getDataChart = async () => {
      setChartData(undefined);
      try {
        if(idFlow){
          const historic = (await getHistoricFlow(idFlow)).value;
          const expected = (await getExpectedFlow(idFlow)).value;
          
          if(historic && expected){
            const expectedArray = expected.map((item) => item.duration);
            const labels = expected.map((item) => item.name);
           
            const resultado = mesclaVetores(labels, historic, expectedArray);
            setChartData(resultado);
          } else {
            setBlankText("Não há dados para serem exibidos");
          }
        }
      } catch (error) {
        console.log("erro")
      }
    }

    return (
        <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
          <Box backgroundColor="#ffffff" borderRadius="8px">
            <Flex w="100%">
              <Accordion allowMultiple style={{ 
                width: "100%",
              }}>
                <AccordionItem border="hidden">
                  <h2>
                    <AccordionButton>
                      <AccordionIcon />
                      <Box
                        as="span"
                        flex="1"
                        textAlign="left"
                        marginLeft="18"
                        fontSize="17px"
                        fontWeight="600"
                        fontStyle="normal"
                        lineHeight="24px"
                      >
                        Visualizar tempo médio de cada etapa
                      </Box>
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                  <Box display="flex" flexDirection="row">
                    <Flex width="100%" justifyContent="space-between">
                      <Flex width="80%">
                          <Select
                            id="flowSelect"
                            placeholder="Selecionar Fluxo"
                            color="gray.500"
                            onChange={(e) => {
                              setIdFlow(parseInt(e.target.value, 10));
                              setNameFlow(e.target.children[e.target.selectedIndex].text);
                            }}
                            options={
                              flowsData?.value
                                ? flowsData?.value?.map((flow) => {
                                  return {
                                    value: flow.idFlow,
                                    label: flow.name,
                                  };
                                })
                                : []
                            }
                          />

                          <Button
                            aria-label="Pesquisar"
                            colorScheme="green"
                            marginLeft="2"
                            justifyContent="center"
                            type="submit"
                            onClick={getDataChart}
                            >Pesquisar
                          </Button>
                      </Flex>
                        <Flex justifyContent="end">
                          <Button
                            colorScheme="blue"
                            size="md"
                            gap={8}
                            marginLeft="8px"
                            marginRight="8px" 
                          >
                            <Image width="20px" src="src/images/pdf.svg" />
                          </Button>
                          <Button colorScheme="blue" size="md">
                            <Image width="20px" src="src/images/csv.svg" />
                          </Button>
                      </Flex>
                    </Flex>
                  </Box>
                  <Flex justifyContent="center">
                    <Box width="60%" justifyContent="space-around">
                      { chartData
                        ? (<ChartTempos value={chartData} nameFlow={nameFlow} />)
                        : <Text textAlign="center" fontWeight="bolder" padding="10px">{blankText}</Text>
                      }
                    </Box>
                  </Flex>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Flex>
          </Box>
        </Flex>
    );
  }