import { Flex, Text, Button } from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";
import { useLocation } from "react-router-dom";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { PrivateLayout } from "layouts/Private";

function ProcessDetail() {
  const location = useLocation();
  const { process } = location.state;

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Processo {process?.record}
          </Text>
          <Button
            size="xs"
            fontSize="sm"
            marginTop={1}
            colorScheme="blue"
            onClick={() => console.log("voltar")}
          >
            <Icon as={IoReturnDownBackOutline} mr="2" boxSize={3} /> Voltar aos
            processos
          </Button>
        </Flex>
      </Flex>
    </PrivateLayout>
  );
}

export default ProcessDetail;
