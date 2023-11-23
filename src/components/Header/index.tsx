import {
  Avatar,
  AvatarGroup,
  Button,
  Flex,
  Image,
  Progress,
} from "@chakra-ui/react";

import { useAuth } from "hooks/useAuth";
import { useLoading } from "hooks/useLoading";
import { HeaderLink } from "./HeaderLink";

export function Header() {
  const { isAuthenticated, handleLogout } = useAuth();
  const { isLoading } = useLoading();

  return (
    <Flex
      py="4"
      mb={isAuthenticated ? "8" : 0}
      w="100%"
      alignItems="center"
      justifyContent="center"
      backgroundColor="white"
      position="relative"
    >
      <Flex
        w="90%"
        maxW={1120}
        alignItems="center"
        justifyContent="space-between"
      >
        <Image w="20%" maxW="24" src="/assets/logo.png" />
        {isAuthenticated ? (
          <Flex alignItems="center" ml="auto" gap="5">
            <HeaderLink href="/contribuidores">Sobre</HeaderLink>
            <AvatarGroup spacing="1rem">
              <Avatar bg="black" />
            </AvatarGroup>
            <Button
              size={["xs", "sm"]}
              colorScheme="red"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </Flex>
        ) : (
          <Flex gap={["3", "4"]} alignItems="center" justifyContent="end">
            <HeaderLink href="/">Login</HeaderLink>
            <HeaderLink href="/cadastro">Cadastro</HeaderLink>
            <HeaderLink href="/contribuidores">Sobre</HeaderLink>
          </Flex>
        )}
      </Flex>
      {isLoading && (
        <Progress
          position="absolute"
          top="100%"
          w="100%"
          background="gray.200"
          colorScheme="green"
          isIndeterminate
          height={[2, 2.5]}
        />
      )}
    </Flex>
  );
}
