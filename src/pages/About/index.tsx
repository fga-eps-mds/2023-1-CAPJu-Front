import { Flex, Box, Text, Image, Button } from "@chakra-ui/react";
import { aboutCapju } from "utils/aboutText";
import { colors } from "styles/colors";
import logoJusticaFederal from "../../images/justica_federal.png";
import logoUnB from "../../images/UnB.png";
import AboutAccordion from "./Accordion";

function About() {
  return (
    <Flex flex="1" w="100%" p={["10", "20"]}>
      <Flex
        w="100%"
        borderRadius={20}
        backgroundColor="white"
        boxShadow="base"
        justifyContent="center"
        p={["5", "5"]}
      >
        <Box width="40%" borderLeftRadius={20} pr={5}>
          <Text fontSize={["lg", "xl"]} fontWeight="semibold">
            O que é o CAPJu?
          </Text>
          <Text textAlign="justify" mt={10}>
            {aboutCapju}
          </Text>
          <Button
            mt={5}
            backgroundColor={colors.green["500"]}
            color="white"
            p={["10", "5"]}
          >
            Veja Mais
          </Button>
          <Box
            mt={10}
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={5}
          >
            <Image
              src={logoJusticaFederal}
              alt="Logo Justiça Federal"
              width="100px"
            />
            <Image src={logoUnB} alt="Logo UnB" width="100px" />
          </Box>
        </Box>
        <Box width="60%" borderRightRadius={20} pl={5}>
          <Text fontSize={["lg", "xl"]} fontWeight="semibold">
            Contribuidores
          </Text>
          <Box mt={10}>
            <Box>
              <Text fontSize={["md", "md"]} fontWeight="semibold">
                Idealizador
              </Text>
              <Text>Nome: Wellington José Barbosa Carlos</Text>
              <Text>Email: wellington.carlos@trf1.jus.br</Text>
            </Box>
            <Box>
              <Text fontSize={["md", "md"]} fontWeight="semibold">
                Responsável Técnico
              </Text>
              <Text>Nome: Hilmer Rodrigues Neri </Text>
              <Text>Email: hilmer@unb.br</Text>
            </Box>
            <Box mt={10}>
              <AboutAccordion />
            </Box>
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}

export default About;
