import { Flex, Card, CardBody, Button, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { PrivateLayout } from "layouts/Private";
import { useAuth } from "hooks/useAuth";

function AccountEdition() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <PrivateLayout>
      <Card p="10" w="90%" maxW="454" mt="16">
        <CardBody
          w="100%"
          p={0}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap="3"
        >
          <Text
            fontSize={["lg", "xl"]}
            fontWeight="semibold"
            textAlign="center"
          >
            Editar conta - Usuário {user?.fullName}
          </Text>
          <Flex
            w="100%"
            alignItems="center"
            justifyContent="center"
            gap="2"
            flexWrap="wrap"
          >
            <Button
              w={["100%", "fit-content"]}
              colorScheme="blue"
              onClick={() => navigate("/editar-conta/email", { replace: true })}
              size="sm"
            >
              Editar email
            </Button>
            <Button
              w={["100%", "fit-content"]}
              colorScheme="red"
              onClick={() => navigate("/editar-conta/senha", { replace: true })}
              size="sm"
            >
              Editar senha
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </PrivateLayout>
  );
}

export default AccountEdition;
