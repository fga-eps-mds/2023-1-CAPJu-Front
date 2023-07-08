import { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
import { NavigationTabs } from "components/NavigationTabs";
import { useAuth } from "hooks/useAuth";
import DataUpdateModal from "components/DataUpdateModal";
import { handleVerifyInDefaultEmail } from "utils/defaultEmails";
import { Tutorial } from "components/Tutorial";


interface BaseLayoutProps {
  children?: ReactNode;
}

export function PrivateLayout({ children }: BaseLayoutProps) {
  const { user } = useAuth();
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

      {user?.firstLogin &&
        user?.email &&
        handleVerifyInDefaultEmail(user.email) && (
          <DataUpdateModal user={user} />
        )}
      <Tutorial />
    </Flex>
  );
}
