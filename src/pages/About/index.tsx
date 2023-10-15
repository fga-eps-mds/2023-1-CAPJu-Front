import { Flex, Box, Text, Image, Button } from "@chakra-ui/react";

import {
  aboutCapju,
  creatorsEmail,
  creatorsName,
  professorName,
  techinicalManagerName,
} from "utils/aboutText";
import { colors } from "styles/colors";
import logoJusticaFederal from "images/justica_federal.png";
import logoUnB from "images/unb.png";
import { useAuth } from "hooks/useAuth";
import AboutAccordion from "./Accordion";

function About() {
  const { isAuthenticated } = useAuth();

  return (
    <Flex flex="2" w="90%" py={isAuthenticated ? "1" : "10"} maxW={1120}>
      <Flex
        w="100%"
        borderRadius={20}
        backgroundColor="white"
        boxShadow="base"
        justifyContent="center"
        p="10"
        flexWrap="wrap"
        height="fit-content"
      >
        <Box
          borderLeftRadius={20}
          pr={3}
          width={["100%", "100%", "100%", "50%"]}
        >
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
        <Box
          borderRightRadius={20}
          pl={3}
          width={["100%", "100%", "100%", "50%"]}
        >
          <Text fontSize={["lg", "xl"]} fontWeight="semibold">
            Contribuidores
          </Text>
          <Box mt={10}>
            <Box>
              <Text fontSize={["md", "md"]} fontWeight="semibold">
                Idealizador
              </Text>
              <Text>Nome: {creatorsName}</Text>
              <Text>Email: {creatorsEmail}</Text>
            </Box>
            <Box mt={1}>
              <Text fontSize={["md", "md"]} fontWeight="semibold">
                Responsável Técnico
              </Text>
              <Text>Nome: {techinicalManagerName} </Text>
              <Text>Email:</Text>
            </Box>
            <Box mt={1}>
              <Text fontSize={["md", "md"]} fontWeight="semibold">
                Professor Responsável
              </Text>
              <Text>Nome: {professorName} </Text>
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
