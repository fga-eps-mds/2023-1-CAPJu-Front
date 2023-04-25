import { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import { NavigationTabs } from "components/NavigationTabs";

interface BaseLayoutProps {
  children?: ReactNode;
}

export function PrivateLayout({ children }: BaseLayoutProps) {
  return (
    <Flex
      w="100%"
      maxW={1120}
      flex="1"
      flexDirection="column"
      alignItems="center"
      justifyContent="start"
    >
      <NavigationTabs />
      {children}
    </Flex>
  );
}
