import { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";

import { BaseLayout } from "layouts/Base";

interface PrivateLayoutProps {
  children: ReactNode;
}

export function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <BaseLayout>
      <Flex w="100%" flex="1" alignItems="center" justifyContent="start">
        {children}
      </Flex>
    </BaseLayout>
  );
}
