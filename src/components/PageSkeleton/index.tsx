import { Flex, Skeleton, VStack } from "@chakra-ui/react";

import { useAuth } from "hooks/useAuth";

export function PageSkeleton() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <VStack align="stretch" spacing={10} maxW={1120} w="90%">
      <Skeleton w="100%" h="9" />
      <Flex justifyContent="space-between">
        <Skeleton w={["30%", "25%", "20%"]} h="9" />
        <Skeleton w={["30%", "25%", "20%"]} h="9" />
      </Flex>
      <Skeleton w="100%" h="450" />
    </VStack>
  ) : (
    <Flex
      alignItems="center"
      justifyContent="center"
      h="100%"
      w="100%"
      flex="1"
    >
      <Skeleton w="90%" maxW="460" h="520" />
    </Flex>
  );
}
