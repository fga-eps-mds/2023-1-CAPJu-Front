import { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";

import { BaseLayout } from "layouts/Base";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <BaseLayout>
      <Flex w="100%" flex="1" alignItems="center" justifyContent="center">
        {children}
      </Flex>
    </BaseLayout>
  );
}
