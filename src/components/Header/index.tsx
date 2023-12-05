import {
  Button,
  Flex,
  Image,
  Progress,
  Tab,
  TabList,
  Tabs,
} from "@chakra-ui/react";

import { useAuth } from "hooks/useAuth";
import { useLoading } from "hooks/useLoading";
import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { HeaderLink } from "./HeaderLink";
import { tabs } from "../../utils/tabs";
import { isActionAllowedToUser } from "../../utils/permissions";

export function Header() {
  const { getUserData } = useAuth();
  const { isAuthenticated, handleLogout } = useAuth();
  const { isLoading } = useLoading();

  const { data: userData } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
    refetchOnWindowFocus: false,
  });

  const location = useLocation();
  const currentTabIndex = useMemo<number | undefined>(() => {
    const currentPathIndex = location.pathname
        .split("/")
        .filter((_item, index) => index < 2)
        .join("/");
    const currentTab = tabs.find((tab) => tab.pathIndex === currentPathIndex);

    return currentTab ? tabs.indexOf(currentTab) : undefined;
  }, [tabs, location]);

  const isUserAllowedInTab = useCallback(
      (tabAction: string | undefined) => {
        if (!tabAction) return true;
        if (!userData?.value) return false;
        if (tabAction === "manage-profiles" && userData?.value?.idRole === 5)
          return true;

        return isActionAllowedToUser(userData?.value?.allowedActions, tabAction);
      },
      [userData]
  );
  const [tabIndex, setTabIndex] = useState<number | undefined>(currentTabIndex);
  const navigate = useNavigate();

  return (
      <Flex
          py="4"
          // mb={isAuthenticated ? "8" : 0}
          w="100%"
          alignItems="center"
          justifyContent="center"
          backgroundColor="white"
          position="relative"
      >
        <Flex
            w="90%"
            maxW={1162}
            alignItems="center"
            justifyContent="space-between"
        >
          <Image w="20%" maxW="24" src="/assets/logo.png" />
          {isAuthenticated ? (
              <>
                <Flex alignItems="center" ml="12px" gap="5">
                  <Tabs
                      w="100%"
                      variant="line"
                      colorScheme="green"
                      index={tabIndex}
                      size="lg"
                  >
                    <TabList sx={{ borderBottom: "unset" }}>
                      {tabs.map((tab, index) => {
                        const isCurrentTab = currentTabIndex === index;
                        let cursor = isCurrentTab ? "default" : "pointer";

                        if (!isUserAllowedInTab(tab.action)) cursor = "not-allowed";

                        const handleClick = () => {
                          if (isUserAllowedInTab(tab.action)) {
                            navigate(tab.path);
                            setTabIndex(index);
                          }
                        };

                        return (
                            <Tab
                                sx={{ paddingBottom: "5px", fontSize: "16px" }}
                                key={tab.label}
                                onClick={handleClick}
                                cursor={cursor}
                                minW="fit-content"
                                opacity={isUserAllowedInTab(tab.action) ? 1 : 0.25}
                            >
                              {tab.label}
                            </Tab>
                        );
                      })}
                    </TabList>
                  </Tabs>
                </Flex>
                <Flex alignItems="center" ml="20px" gap="5">
                  <HeaderLink href="/contribuidores">Sobre</HeaderLink>
                  <Button
                      size={["xs", "sm"]}
                      colorScheme="red"
                      onClick={() => handleLogout()}
                  >
                    Sair
                  </Button>
                </Flex>
              </>
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
