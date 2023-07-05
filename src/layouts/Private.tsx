import { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import { NavigationTabs } from "components/NavigationTabs";
import { Tutorial } from "components/Tutorial";

interface BaseLayoutProps {
  children?: ReactNode;
}

export function PrivateLayout({ children }: BaseLayoutProps) {
  return (
    <Flex
      w="100%"
      flex="1"
      flexDirection="column"
      alignItems="center"
      justifyContent="start"
      pb="8"
    >
      <NavigationTabs />
      {children}
      <Tutorial />
    </Flex>
  );
}
