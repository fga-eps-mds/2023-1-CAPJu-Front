import { Tabs, TabList, Tab, Flex } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";

import { isActionAllowedToUser } from "utils/permissions";
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
  const [tabIndex, setTabIndex] = useState<number | undefined>(currentTabIndex);

  const isUserAllowedInTab = useCallback(
    (tabAction: string) => {
      if (!userData?.value) return false;
      if (tabAction === "manage-profiles" && userData?.value?.idRole === 5)
        return true;

      return isActionAllowedToUser(userData?.value?.allowedActions, tabAction);
    },
    [userData]
  );

  useEffect(() => {
    if (currentTabIndex === undefined) setTabIndex(-1);
  }, [currentTabIndex]);

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
      <Tabs w="100%" variant="line" colorScheme="green" index={tabIndex}>
        <TabList>
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
  );
}
