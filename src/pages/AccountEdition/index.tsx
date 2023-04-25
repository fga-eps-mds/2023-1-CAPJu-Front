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
            gap="3"
            flexWrap="wrap"
          >
            <Button
              colorScheme="blue"
              onClick={() => navigate("/editar-conta/email")}
            >
              Editar email
            </Button>
            <Button
              colorScheme="red"
              onClick={() => navigate("/editar-conta/senha")}
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
