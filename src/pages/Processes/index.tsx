import { useState } from "react";
import { useQuery } from "react-query";
import {
  Flex,
  Text,
  Button,
  useDisclosure,
  Input,
  Checkbox,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useAuth } from "hooks/useAuth";
import { PrivateLayout } from "layouts/Private";
import { hasPermission } from "utils/permissions";

function Processes() {
  const { getUserData } = useAuth();
  const { data: userData } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const [filter, setFilter] = useState<string>("");
  const [legalPriority, setLegalPriority] = useState(false);
  const {
    // isOpen: isCreationOpen,
    onOpen: onCreationOpen,
    // onClose: onCreationClose,
  } = useDisclosure();

  const isActionDisabled = (actionName: string) =>
    userData?.value ? !hasPermission(userData.value, actionName) : true;

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Processos
          </Text>
          <Button
            size="xs"
            fontSize="sm"
            colorScheme="green"
            isDisabled={isActionDisabled("create-process")}
            onClick={onCreationOpen}
          >
            <AddIcon mr="2" boxSize={3} /> Adicionar Processo
          </Button>
        </Flex>
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Input
            placeholder="Pesquisar processo (Registro ou apelido)"
            width={["100%", "100%", "60%"]}
            value={filter}
            onChange={({ target }) => setFilter(target.value)}
            variant="filled"
            css={{
              "&, &:hover, &:focus": {
                background: "white",
              },
            }}
          />
          <Checkbox
            colorScheme="green"
            borderColor="green"
            checked={legalPriority}
            onClick={() => setLegalPriority(!legalPriority)}
          >
            Mostrar processos com prioridade legal
          </Checkbox>
        </Flex>
      </Flex>
    </PrivateLayout>
  );
}

export default Processes;
