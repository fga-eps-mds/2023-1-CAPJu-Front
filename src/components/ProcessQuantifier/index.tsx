import { Flex, Text } from "@chakra-ui/react";

interface ProcessQuantifierProps {
  processQuantity: string;
  description: string;
  numberColor: string;
}

export function ProcessQuantifier({
  processQuantity,
  description,
  numberColor,
}: ProcessQuantifierProps) {
  return (
    <Flex
      w="21%"
      h="100px"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      border="1px"
      borderColor="#E2E8F0"
      borderRadius="4"
    >
      {" "}
      <Text
        lineHeight="35px"
        fontSize="35px"
        fontWeight="600"
        color={numberColor}
      >
        {processQuantity}
      </Text>
      <Text textAlign="center">{description}</Text>
    </Flex>
  );
}
