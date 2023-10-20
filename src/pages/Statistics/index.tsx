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
} from "@chakra-ui/react";
import { PrivateLayout } from "layouts/Private";

export default function Statistics() {
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
                      lineHeight="24px"
                    >
                      Visualizar quantidade de processos em cada etapa
                    </Box>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Button colorScheme="green">Confirmar</Button>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Flex>
        </Box>
      </Flex>
    </PrivateLayout>
  );
}
