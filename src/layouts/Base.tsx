import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Flex } from "@chakra-ui/react";

import { Header } from "components/Header";

interface BaseLayoutProps {
  children?: ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <Flex
      w="100vw"
      minH="100vh"
      flexDirection="column"
      alignItems="center"
      justifyContent="start"
      backgroundColor="gray.200"
    >
      <Header />
      {children}
      <Outlet />
    </Flex>
  );
}
