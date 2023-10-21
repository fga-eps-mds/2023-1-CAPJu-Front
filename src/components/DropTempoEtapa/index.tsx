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
  } from "@chakra-ui/react";
  import {Select} from "components/FormFields";
  // import { useState} from "react";
  import { PrivateLayout } from "layouts/Private";
  import {useQuery} from "react-query";
  import { useState } from "react";
  import { getFlows, getHistoricFlow, getExpectedFlow  } from "../../services/processManagement/flows";
  import ChartTempos from "./ChartTempos";


  export default function Statistics() {
    const toast = useToast();
    const [idFlow, setIdFlow] = useState<number>();

    const [chartData, setChartData] = useState<any>(null);

    const mesclaVetores = (labels: Array<string>, medio: Array<number>, previsto:Array<number>) => {
        const resultado = labels.map((label, index) => {
          return { label, medio: medio[index], previsto: previsto[index] };
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
      
      if(idFlow){
        const historic = (await getHistoricFlow(idFlow)).value;
        const expected = (await getExpectedFlow(idFlow)).value;

        console.log(expected);
        
        if(historic && expected){
          const expectedArray = expected.map((item) => item.duration);
          const labels = expected.map((item) => item.name);
         
          const resultado = mesclaVetores(labels, historic, expectedArray);
          setChartData(resultado)
        }
      }
    }

    return (
      <PrivateLayout>
        <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
          <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
            <Text
              fontSize="22px"
              fontWeight="600"
              fontStyle="normal"
              fontFamily="Inter"
              lineHeight="24px"
            >
              Estatísticas
            </Text>
          </Flex>
          <Box backgroundColor="#FFF" borderRadius="8px">
            <Flex justifyContent="flex-start" w="100%">
              <Accordion defaultIndex={[0]} allowMultiple>
                <AccordionItem>
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
                        fontFamily="Inter"
                        lineHeight="24px"
                      >
                        Visualizar tempo médio de cgit ada etapa
                      </Box>
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                  <Select
              placeholder="Selecionar Fluxo"
              color="gray.500"
              onChange={(e) => setIdFlow(parseInt(e.target.value, 10))}
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
                        aria-label="TESTANDO ROTA DA API"
                        colorScheme="green"
                        marginLeft="2"
                        justifyContent="center"
                        type="submit"
                        onClick={getDataChart}
                        >Testando rota da API
                      </Button>
                      { chartData? (<ChartTempos value={chartData}/>) : ""}

                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Flex>
          </Box>
        </Flex>
      </PrivateLayout>
    );
  }