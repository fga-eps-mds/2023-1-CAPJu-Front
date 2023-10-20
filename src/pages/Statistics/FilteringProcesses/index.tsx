import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Select,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getFlows } from "services/processManagement/flows";

export default function FilteringProcesses() {
  const [flows, setFlows] = useState([] as Flow[]);

  const getData = async () => {
    const data = await getFlows();
    if (data.value) setFlows(data.value);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <Box backgroundColor="#FFF" borderRadius="8px">
      <Flex justifyContent="flex-start" w="100%">
        <Accordion defaultIndex={[1]} allowMultiple>
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
                  lineHeight="24px"
                >
                  Visualizar quantidade de processos concluídos e/ou
                  interrompidos em cada etapa
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Flex gap="5">
                <Select placeholder="Selecione o Fluxo">
                  {flows?.map((flow) => {
                    return <option value={flow.idFlow}>{flow.name}</option>;
                  })}
                </Select>
                <Select placeholder="Status" w="35%">
                  <option value="archived">Concluído</option>
                  <option value="finished">Interrompido</option>
                </Select>
                <Button colorScheme="whatsapp" w="20%">
                  Confirmar
                </Button>
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
    </Box>
  );
}
