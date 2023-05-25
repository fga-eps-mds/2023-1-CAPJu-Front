import { Tabs, TabList, Tab, Flex } from "@chakra-ui/react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";

import { permissionsArray } from "utils/permissions";
import { useAuth } from "hooks/useAuth";
import { tabs } from "utils/tabs";

export function NavigationTabs() {
  const { getUserData } = useAuth();
  const { data: userData } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const currentTabIndex = useMemo<number | undefined>(() => {
    const currentPathIndex = location.pathname
      .split("/")
      .filter((_item, index) => index < 2)
      .join("/");
    const currentTab = tabs.find((tab) => tab.pathIndex === currentPathIndex);

    return currentTab ? tabs.indexOf(currentTab) : undefined;
  }, [tabs, location]);

  function isUserAllowedInTab(tabIndex: number) {
    if (!userData?.value) return false;

    return permissionsArray.some(
      (item) =>
        item.actions.some((action) => action === tabs[tabIndex].action) &&
        item.users.some((userRole) => userRole === userData?.value?.idRole)
    );
  }

  return (
    <Flex
      w="100%"
      maxW={1120}
      pl={["5vw", "5vw", "5vw", "5vw", 0]}
      justifyContent="start"
      marginBottom="4"
      overflow="scroll"
      css={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "&::-webkit-scrollbar-track": {
          display: "none",
        },
        "&::-webkit-scrollbar-thumb": {
          display: "none",
        },
      }}
    >
      <Tabs
        w="100%"
        variant="line"
        colorScheme="green"
        defaultIndex={currentTabIndex}
      >
        <TabList>
          {tabs.map((tab, index) => {
            const isCurrentTab = currentTabIndex === index;
            let cursor = isCurrentTab ? "default" : "pointer";

            if (!isUserAllowedInTab(index)) cursor = "not-allowed";

            return (
              <Tab
                key={tab.label}
                disabled={!isUserAllowedInTab(index)}
                onClick={() => navigate(tab.path)}
                cursor={cursor}
                minW="fit-content"
                opacity={isUserAllowedInTab(index) ? 1 : 0.25}
              >
                {tab.label}
              </Tab>
            );
          })}
        </TabList>
      </Tabs>
    </Flex>
  );
}
