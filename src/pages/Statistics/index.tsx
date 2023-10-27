import { CategoryScale } from "chart.js";
import {
  Box,
  Flex,
  Text,
} from "@chakra-ui/react";
import Chart from "chart.js/auto";
import { PrivateLayout } from "layouts/Private";
import DropTempoEtapa from "components/DropTempoEtapa";


export default function Statistics() {
  Chart.register(CategoryScale);

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
        <Box borderRadius="8px">
          <Flex justifyContent="flex-start" w="100%" flexDirection="column">
            <DropTempoEtapa />
          </Flex>
        </Box>
      </Flex>
    </PrivateLayout>
  );
}