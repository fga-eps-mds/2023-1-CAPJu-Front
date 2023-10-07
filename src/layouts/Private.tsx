import { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";
// import { NavigationTabs } from "components/NavigationTabs";
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
      w="150%"
      flex="1"
      flexDirection="column"
      alignItems="center"
      justifyContent="start"
      pb="8"
      bg="#1E2952"  // this sets the background color

    >
      asdsadasd
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
