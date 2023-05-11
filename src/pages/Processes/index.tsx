import { Flex, Text } from "@chakra-ui/react";
import { PrivateLayout } from "layouts/Private";

function Processes() {
  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Processos
          </Text>
        </Flex>
      </Flex>
    </PrivateLayout>
  );
}

export default Processes;
